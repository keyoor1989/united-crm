
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
    const telegramBotToken = Deno.env.get('telegram_key') || '';
    
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
      console.error(`Secret token validation failed! Received: ${secretHeader || '[NONE]'}, Expected from DB: ${telegramSecretToken}`);
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
    
    if (!telegramBotToken) {
      console.error("Missing Telegram bot token in environment variables");
      return new Response(
        JSON.stringify({ status: "error", message: "Telegram bot token not configured" }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const telegramApi = `https://api.telegram.org/bot${telegramBotToken}`;

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

    // Process the webhook message
    if (update && update.message) {
      const chatId = update.message.chat.id;
      const messageText = update.message.text || '';
      
      // Check if the chat is authorized
      try {
        const { data: chatData, error: chatError } = await supabase
          .from('telegram_authorized_chats')
          .select('*')
          .eq('chat_id', chatId.toString())
          .eq('is_active', true)
          .single();
        
        if (chatError || !chatData) {
          console.log("Unauthorized chat or chat not active:", chatId);
          
          // For debugging only - send a reply to the unauthorized chat
          try {
            await fetch(`${telegramApi}/sendMessage`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chat_id: chatId,
                text: "Your chat is not authorized. Please contact the system administrator.",
              }),
            });
          } catch (replyError) {
            console.error("Error sending unauthorized message:", replyError);
          }
          
          return new Response(
            JSON.stringify({ status: "error", message: "Unauthorized chat" }), 
            { 
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        // Log the message
        await supabase
          .from('telegram_message_logs')
          .insert({
            chat_id: chatId.toString(),
            message_text: messageText,
            message_type: "incoming_message",
            direction: "incoming",
            processed_status: "processed"
          });
        
        // Reply with a simple message for testing
        if (messageText.toLowerCase() === '/help' || messageText.toLowerCase() === 'help') {
          await fetch(`${telegramApi}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: "Welcome to United Copier bot! This bot is for receiving notifications about service calls, customer follow-ups, and inventory alerts.",
              parse_mode: "HTML"
            }),
          });
        }
        
        // Send back a success response to Telegram
        return new Response(
          JSON.stringify({ status: "success" }), 
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (chatException) {
        console.error("Exception during chat authorization check:", chatException);
        
        return new Response(
          JSON.stringify({ status: "error", message: "Error processing message" }), 
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    } else {
      // If not a message, still return success to acknowledge receipt
      return new Response(
        JSON.stringify({ status: "success" }), 
        { 
          status: 200,
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
