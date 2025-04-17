
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, X-Telegram-Bot-Api-Secret-Token',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ status: "error", message: "Server configuration error" }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check for debug request first - used by the admin panel to test connection
    try {
      const clonedReq = req.clone();
      const body = await clonedReq.json();
      
      if (body && body.type === "debug_request") {
        console.log("Received debug request:", body);
        return new Response(
          JSON.stringify({ 
            status: "success", 
            message: "Debug request received successfully",
            timestamp: new Date().toISOString()
          }), 
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    } catch (e) {
      // Not a JSON body or no debug request, continue with normal processing
    }
    
    // Get the current webhook secret from database
    console.log("Fetching webhook secret from database");
    const { data: configData, error: configError } = await supabase
      .from('telegram_config')
      .select('webhook_secret, webhook_url')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (configError) {
      console.error("Error fetching webhook secret from database:", configError);
      // Continue processing even if we can't get the secret - we'll just skip validation
    }
    
    // Get the secret token from the database
    const telegramSecretToken = configData?.webhook_secret || '';
    
    // Validate the secret token from the request header
    const secretHeader = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
    
    // Debug logging (without exposing full secrets)
    const secretHeaderPrefix = secretHeader ? secretHeader.substring(0, 3) + '...' : '[MISSING]';
    const tokenPrefix = telegramSecretToken ? telegramSecretToken.substring(0, 3) + '...' : '[NOT SET]';
    console.log(`Webhook verification: Header=${secretHeaderPrefix}, DB Token=${tokenPrefix}`);
    
    // For development mode detection
    const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development';
    
    // Skip validation if:
    // 1. No secret token is set in the database (meaning first-time setup)
    // 2. We're in development mode (for testing)
    const skipValidation = !telegramSecretToken || isDevelopment;
    
    if (!skipValidation && secretHeader !== telegramSecretToken) {
      console.error(`Token validation failed: header length=${secretHeader?.length || 0}, db token length=${telegramSecretToken.length}`);
      
      try {
        await supabase
          .from('telegram_message_logs')
          .insert({
            chat_id: "system",
            message_text: `Token validation failed. Received token does not match stored token.`,
            message_type: "webhook_error",
            direction: "incoming",
            processed_status: "unauthorized"
          });
      } catch (logErr) {
        console.error("Failed to log token validation error:", logErr);
      }
      
      return new Response(
        JSON.stringify({ status: "error", message: "Unauthorized - Secret token validation failed" }), 
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (skipValidation) {
      console.log("Skipping token validation due to missing secret or development mode");
    } else {
      console.log("Secret token validation successful");
    }
    
    // Parse the webhook update from Telegram
    let update;
    try {
      update = await req.json();
      console.log("Received webhook update");
    } catch (e) {
      console.error("Error parsing webhook JSON:", e);
      return new Response(
        JSON.stringify({ status: "error", message: "Invalid JSON payload" }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log the incoming webhook for debugging
    try {
      const { error: logError } = await supabase
        .from('telegram_message_logs')
        .insert({
          chat_id: update?.message?.chat?.id?.toString() || update?.edited_message?.chat?.id?.toString() || "unknown",
          message_text: JSON.stringify(update).substring(0, 500),
          message_type: "webhook_received",
          direction: "incoming",
          processed_status: "received"
        });
      
      if (logError) {
        console.error("Error logging webhook:", logError);
      }
    } catch (logException) {
      console.error("Exception during webhook logging:", logException);
    }

    // Forward the update to the main webhook handler
    try {
      const webhookResponse = await supabase.functions.invoke("telegram-webhook", {
        body: update
      });
      
      if (webhookResponse.error) {
        console.error("Error forwarding webhook to handler:", webhookResponse.error);
        
        return new Response(
          JSON.stringify({ status: "error", message: "Error processing webhook" }), 
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ status: "success" }), 
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (e) {
      console.error("Exception forwarding webhook:", e);
      
      return new Response(
        JSON.stringify({ status: "error", message: "Error forwarding webhook" }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (e) {
    console.error("Unhandled exception in webhook proxy:", e);
    return new Response(
      JSON.stringify({ status: "error", message: "Unhandled exception" }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
