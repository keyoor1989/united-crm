
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
    const { action, webhook_url } = await req.json();
    
    // Always get the token from environment variables, not from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const telegramBotToken = Deno.env.get('telegram_key') || '';
    
    if (!telegramBotToken) {
      console.error("Missing Telegram bot token in environment variables");
      return new Response(
        JSON.stringify({ error: 'Telegram bot token is not configured in Supabase secrets' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const telegramApi = `https://api.telegram.org/bot${telegramBotToken}`;

    console.log(`Using Telegram API endpoint: ${telegramApi}`);
    
    // Handle different actions
    switch (action) {
      case 'getWebhookInfo':
        try {
          const response = await fetch(`${telegramApi}/getWebhookInfo`);
          const webhookInfo = await response.json();
          
          console.log("Webhook info response:", JSON.stringify(webhookInfo));
          
          // Update telegram_config table with the correct token
          try {
            const { data: configData } = await supabase
              .from('telegram_config')
              .select('*')
              .limit(1);
              
            if (configData && configData.length > 0) {
              await supabase
                .from('telegram_config')
                .update({ 
                  bot_token: telegramBotToken,
                  updated_at: new Date().toISOString()
                })
                .eq('id', configData[0].id);
                
              console.log("Updated token in database");
            } else {
              await supabase
                .from('telegram_config')
                .insert({
                  bot_token: telegramBotToken,
                  webhook_url: webhookInfo.result?.url || null,
                });
                
              console.log("Inserted token in database");
            }
          } catch (dbError) {
            console.error("Error updating token in database:", dbError);
          }
          
          return new Response(
            JSON.stringify(webhookInfo),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          );
        } catch (error) {
          console.error("Error getting webhook info:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }
        
      case 'setWebhook':
        if (!webhook_url) {
          return new Response(
            JSON.stringify({ error: 'webhook_url is required' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          );
        }
        
        try {
          // Set allowed updates to filter message types
          const allowedUpdates = ['message', 'edited_message'];
          
          console.log(`Setting webhook to: ${webhook_url}`);
          
          const response = await fetch(
            `${telegramApi}/setWebhook?url=${encodeURIComponent(webhook_url)}&allowed_updates=${JSON.stringify(allowedUpdates)}`
          );
          const result = await response.json();
          
          console.log("Set webhook response:", JSON.stringify(result));
          
          // Update the webhook URL in our database
          if (result.ok) {
            const { data: configData } = await supabase
              .from('telegram_config')
              .select('*')
              .limit(1);
              
            if (configData && configData.length > 0) {
              await supabase
                .from('telegram_config')
                .update({ 
                  bot_token: telegramBotToken,
                  webhook_url,
                  updated_at: new Date().toISOString()
                })
                .eq('id', configData[0].id);
            } else {
              await supabase
                .from('telegram_config')
                .insert({
                  bot_token: telegramBotToken,
                  webhook_url,
                });
            }
          }
          
          return new Response(
            JSON.stringify(result),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          );
        } catch (error) {
          console.error("Error setting webhook:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }
        
      case 'deleteWebhook':
        try {
          console.log("Deleting webhook");
          
          const response = await fetch(`${telegramApi}/deleteWebhook`);
          const result = await response.json();
          
          console.log("Delete webhook response:", JSON.stringify(result));
          
          // Update our database
          if (result.ok) {
            const { data: configData } = await supabase
              .from('telegram_config')
              .select('*')
              .limit(1);
              
            if (configData && configData.length > 0) {
              await supabase
                .from('telegram_config')
                .update({ 
                  webhook_url: null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', configData[0].id);
            }
          }
          
          return new Response(
            JSON.stringify(result),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          );
        } catch (error) {
          console.error("Error deleting webhook:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
    }
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
