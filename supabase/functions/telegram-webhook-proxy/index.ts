
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

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
          chat_id: update?.message?.chat?.id?.toString() || "unknown",
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

    // Forward the webhook to the main handler
    try {
      const response = await fetch(
        "https://klieshkrqryigtqtshka.supabase.co/functions/v1/telegram-webhook",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(update),
        }
      );
      
      // If the forwarding fails, report it immediately
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error forwarding to webhook handler:", 
          response.status, 
          response.statusText, 
          errorText
        );
        
        // Log the failure to the database
        await supabase
          .from('telegram_message_logs')
          .insert({
            chat_id: update?.message?.chat?.id?.toString() || "unknown",
            message_text: `Webhook forwarding failed: ${response.status} ${response.statusText} - ${errorText}`,
            message_type: "webhook_error",
            direction: "internal",
            processed_status: "failed"
          });
          
        return new Response(
          JSON.stringify({ status: "error", message: "Error processing webhook" }), 
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      console.log("Webhook forwarded successfully");
      
      // Return success to Telegram so it doesn't retry
      return new Response(
        JSON.stringify({ status: "success" }), 
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (forwardException) {
      console.error("Exception forwarding webhook:", forwardException);
      
      // Log the exception to the database
      await supabase
        .from('telegram_message_logs')
        .insert({
          chat_id: update?.message?.chat?.id?.toString() || "unknown",
          message_text: `Webhook forwarding exception: ${forwardException.message}`,
          message_type: "webhook_error",
          direction: "internal",
          processed_status: "failed"
        });
        
      return new Response(
        JSON.stringify({ status: "error", message: "Exception forwarding webhook" }), 
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
