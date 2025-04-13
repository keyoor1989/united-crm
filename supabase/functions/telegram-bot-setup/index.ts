
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
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
    
    if (!telegramBotToken) {
      return new Response(
        JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN is not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const telegramApi = `https://api.telegram.org/bot${telegramBotToken}`;
    
    // Handle different actions
    switch (action) {
      case 'getWebhookInfo':
        try {
          const response = await fetch(`${telegramApi}/getWebhookInfo`);
          const webhookInfo = await response.json();
          
          return new Response(
            JSON.stringify(webhookInfo),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          );
        } catch (error) {
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
          
          const response = await fetch(
            `${telegramApi}/setWebhook?url=${encodeURIComponent(webhook_url)}&allowed_updates=${JSON.stringify(allowedUpdates)}`
          );
          const result = await response.json();
          
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
          const response = await fetch(`${telegramApi}/deleteWebhook`);
          const result = await response.json();
          
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
