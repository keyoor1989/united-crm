
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const telegramBotToken = Deno.env.get('telegram_key') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get request body
    const requestData = await req.json();
    const { action, webhook_url } = requestData;
    
    console.log(`Processing action: ${action}`);
    
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: action' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Set webhook URL for the bot
    if (action === 'setWebhook') {
      if (!webhook_url) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameter: webhook_url' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }
      
      // Generate a random secret token for webhook verification
      const webhookSecret = crypto.randomUUID();
      
      console.log(`Setting webhook to: ${webhook_url}`);
      
      const webhookResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhook_url,
          secret_token: webhookSecret,
          allowed_updates: ["message", "callback_query"],
        }),
      });
      
      const webhookData = await webhookResponse.json();
      console.log("Webhook setup response:", webhookData);
      
      if (webhookData.ok) {
        // Update webhook URL and secret in DB
        await supabase
          .from('telegram_config')
          .update({ 
            webhook_url, 
            webhook_secret: webhookSecret,
            updated_at: new Date().toISOString() 
          })
          .eq('id', (await supabase.from('telegram_config').select('id').limit(1).single()).data.id);
      }
      
      return new Response(
        JSON.stringify(webhookData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    // Delete webhook
    if (action === 'deleteWebhook') {
      console.log("Deleting webhook");
      
      const webhookResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/deleteWebhook?drop_pending_updates=true`, {
        method: 'POST'
      });
      
      const webhookData = await webhookResponse.json();
      console.log("Webhook deletion response:", webhookData);
      
      if (webhookData.ok) {
        // Update webhook URL in DB
        await supabase
          .from('telegram_config')
          .update({ 
            webhook_url: null,
            webhook_secret: null,
            updated_at: new Date().toISOString() 
          })
          .eq('id', (await supabase.from('telegram_config').select('id').limit(1).single()).data.id);
      }
      
      return new Response(
        JSON.stringify(webhookData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    // Get webhook info
    if (action === 'getWebhookInfo') {
      console.log("Getting webhook info");
      
      const webhookResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getWebhookInfo`);
      const webhookData = await webhookResponse.json();
      
      console.log("Webhook info:", webhookData);
      
      return new Response(
        JSON.stringify(webhookData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    // Set commands
    if (action === 'setCommands') {
      console.log("Setting bot commands");
      
      const commandsResult = await setCommands(telegramBotToken);
      
      return new Response(
        JSON.stringify(commandsResult),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
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

async function setCommands(botToken: string) {
  const commands = [
    { command: 'start', description: 'Start using the bot' },
    { command: 'help', description: 'Get help with using the bot' },
    { command: 'report', description: 'Get a daily business report' }
  ];
  
  console.log("Registering commands:", commands);
  
  const commandResponse = await fetch(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ commands }),
  });
  
  const responseData = await commandResponse.json();
  console.log("Command registration response:", responseData);
  
  return responseData;
}
