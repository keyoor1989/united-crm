
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const telegramBotToken = Deno.env.get('telegram_key') || '';
    if (!telegramBotToken) {
      return new Response(
        JSON.stringify({ error: 'Telegram bot token is not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    const telegramApi = `https://api.telegram.org/bot${telegramBotToken}`;
    const { action, webhook_url } = await req.json();
    
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: action' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    let response;
    
    switch (action) {
      case 'setWebhook':
        if (!webhook_url) {
          return new Response(
            JSON.stringify({ error: 'Missing required parameter: webhook_url' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }
        
        response = await fetch(`${telegramApi}/setWebhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: webhook_url,
            allowed_updates: ["message", "edited_message", "callback_query"]
          }),
        });
        break;
        
      case 'deleteWebhook':
        response = await fetch(`${telegramApi}/deleteWebhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            drop_pending_updates: true
          }),
        });
        break;
        
      case 'getWebhookInfo':
        response = await fetch(`${telegramApi}/getWebhookInfo`);
        break;
        
      case 'setCommands':
        // Set commands for the bot
        const commands = [
          { command: "start", description: "Start the bot" },
          { command: "help", description: "Get help with using the bot" },
          { command: "report", description: "Get a daily activity report" }
        ];
        
        response = await fetch(`${telegramApi}/setMyCommands`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            commands: commands
          }),
        });
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
    }
    
    const responseData = await response.json();
    
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in telegram-bot-setup:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
