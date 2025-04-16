
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const BOT_TOKEN = Deno.env.get('telegram_key') || '';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function getWebhookInfo(): Promise<Response> {
  try {
    const response = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

async function setWebhook(url: string): Promise<Response> {
  try {
    // Set allowed updates to messages and edited messages only
    const allowedUpdates = ['message', 'edited_message'];
    
    // Use Telegram's setWebhook API
    const response = await fetch(
      `${TELEGRAM_API}/setWebhook?url=${encodeURIComponent(url)}&allowed_updates=${JSON.stringify(allowedUpdates)}`
    );
    const data = await response.json();
    
    console.log(`Webhook set response:`, data);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`Error setting webhook:`, error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

async function deleteWebhook(): Promise<Response> {
  try {
    const response = await fetch(`${TELEGRAM_API}/deleteWebhook?drop_pending_updates=true`);
    const data = await response.json();
    
    console.log("Webhook deleted successfully:", data);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

async function setCommands(): Promise<Response> {
  try {
    const commands = [
      { command: "start", description: "Start using the bot" },
      { command: "help", description: "Show available commands and usage" },
      { command: "lookup", description: "Look up customer by phone number" },
      { command: "report", description: "Get today's activity report" }
    ];
    
    console.log("Setting commands:", commands);
    
    const response = await fetch(`${TELEGRAM_API}/setMyCommands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commands }),
    });
    
    const data = await response.json();
    console.log("Set commands response:", data);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error setting commands:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

async function getBotInfo(): Promise<Response> {
  try {
    const response = await fetch(`${TELEGRAM_API}/getMe`);
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, webhook_url } = await req.json();

    switch (action) {
      case 'getWebhookInfo':
        return await getWebhookInfo();
      case 'setWebhook':
        if (!webhook_url) {
          return new Response(JSON.stringify({ error: 'Webhook URL is required' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
        return await setWebhook(webhook_url);
      case 'deleteWebhook':
        return await deleteWebhook();
      case 'setCommands':
        return await setCommands();
      case 'getBotInfo':
        return await getBotInfo();
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
