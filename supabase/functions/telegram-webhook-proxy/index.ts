
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
    
    try {
      // Get the current webhook secret from database - explicitly request without caching
      console.log("Fetching webhook secret from database");
      const { data: configData, error: configError } = await supabase
        .from('telegram_config')
        .select('webhook_secret, webhook_url')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
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
      const telegramSecretToken = configData?.webhook_secret || '';
      
      // Validate the secret token from the request header
      const secretHeader = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
      
      // DETAILED DEBUG LOGGING - first characters only for security
      console.log("==================== TOKEN VALIDATION DEBUG ====================");
      console.log(`Received header: ${secretHeader ? secretHeader.substring(0, 10) + '...' : '[MISSING]'}`);
      console.log(`Database token: ${telegramSecretToken ? telegramSecretToken.substring(0, 10) + '...' : '[NOT SET]'}`);
      console.log(`Header length: ${secretHeader ? secretHeader.length : 0}, DB token length: ${telegramSecretToken ? telegramSecretToken.length : 0}`);
      console.log(`Tokens match: ${secretHeader === telegramSecretToken ? 'YES' : 'NO'}`);
      console.log("================================================================");
      
      if (telegramSecretToken && secretHeader !== telegramSecretToken) {
        console.error(`SECRET TOKEN VALIDATION FAILED!`);
        console.error(`Received token (first 10 chars): ${secretHeader ? secretHeader.substring(0, 10) + '...' : '[NONE]'}`);
        console.error(`Expected token (first 10 chars): ${telegramSecretToken.substring(0, 10) + '...'}`);
        console.error(`Header length: ${secretHeader ? secretHeader.length : 0}, DB token length: ${telegramSecretToken.length}`);
        
        // For deep debugging, log all the hex codes of the first several characters
        if (secretHeader && telegramSecretToken) {
          const headerChars = secretHeader.substring(0, 20).split('').map(c => c.charCodeAt(0).toString(16)).join(' ');
          const dbChars = telegramSecretToken.substring(0, 20).split('').map(c => c.charCodeAt(0).toString(16)).join(' ');
          console.error(`Header hex: ${headerChars}`);
          console.error(`DB hex: ${dbChars}`);
        }
        
        // Log the failing request for debugging
        try {
          const requestBody = await req.clone().text();
          console.error("Request body that failed validation:", requestBody.substring(0, 500));
        } catch (e) {
          console.error("Could not log request body:", e);
        }
        
        // Try to log the invalid token to the database for debugging
        try {
          await supabase
            .from('telegram_message_logs')
            .insert({
              chat_id: "system",
              message_text: `Token validation failed. Received: ${secretHeader ? secretHeader.substring(0, 10) + '...' : '[NONE]'}, Expected: ${telegramSecretToken.substring(0, 10) + '...'}`,
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
      } else if (!telegramSecretToken) {
        console.warn("No webhook secret found in database, skipping validation");
      } else {
        console.log("Secret token validation successful");
      }
    } catch (dbError) {
      console.error("Exception during token validation:", dbError);
      // Continue processing even on validation error - this is critical
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
      JSON.stringify({ status: "error", message: "Unhandled exception", error: e.message, stack: e.stack }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
    );
  }
});
