
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
    
    // Get the current webhook secret from database
    const { data: configData, error: configError } = await supabase
      .from('telegram_config')
      .select('webhook_secret')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (configError) {
      console.error("Error fetching webhook secret from database:", configError);
      return new Response(
        JSON.stringify({ status: "error", message: "Failed to retrieve webhook configuration" }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Get the secret token from the database
    const telegramSecretToken = configData?.[0]?.webhook_secret || '';
    
    // Validate the secret token from the request header
    const secretHeader = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
    
    console.log(`Received webhook request with header X-Telegram-Bot-Api-Secret-Token: ${secretHeader ? '[PRESENT]' : '[MISSING]'}`);
    console.log(`Database webhook secret: ${telegramSecretToken ? telegramSecretToken.substring(0, 3) + '...' : '[NOT SET]'}`);
    
    if (telegramSecretToken && secretHeader !== telegramSecretToken) {
      console.error(`Secret token validation failed! Received: ${secretHeader || '[NONE]'}, Expected from DB: ${telegramSecretToken.substring(0, 3) + '...'}`);
      return new Response(
        JSON.stringify({ status: "error", message: "Unauthorized - Secret token validation failed" }), 
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      console.log("Secret token validation successful or not configured");
    }
    
    // Parse the webhook update from Telegram
    let update;
    try {
      update = await req.json();
      console.log("Received webhook update:", JSON.stringify(update).substring(0, 200) + "...");
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
        
        // Log the error
        try {
          await supabase
            .from('telegram_message_logs')
            .insert({
              chat_id: update?.message?.chat?.id?.toString() || update?.edited_message?.chat?.id?.toString() || "unknown",
              message_text: `Error forwarding webhook: ${JSON.stringify(webhookResponse.error)}`,
              message_type: "webhook_error",
              direction: "internal",
              processed_status: "error"
            });
        } catch (logErr) {
          console.error("Failed to log error:", logErr);
        }
        
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
      
      // Log the error
      try {
        await supabase
          .from('telegram_message_logs')
          .insert({
            chat_id: update?.message?.chat?.id?.toString() || update?.edited_message?.chat?.id?.toString() || "unknown",
            message_text: `Exception forwarding webhook: ${e.message}`,
            message_type: "webhook_error",
            direction: "internal",
            processed_status: "error"
          });
      } catch (logErr) {
        console.error("Failed to log error:", logErr);
      }
      
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
