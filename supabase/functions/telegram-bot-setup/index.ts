
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
    
    // Generate new secret token for webhook if setting a webhook
    let telegramSecretToken = '';
    if (action === 'setWebhook') {
      // Always generate a new token when setting webhook to ensure fresh authentication
      telegramSecretToken = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      console.log(`Generated new webhook secret token: ${telegramSecretToken}`);
      
      // Store the webhook secret in the database
      const { data: existingConfig } = await supabase
        .from('telegram_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (existingConfig && existingConfig.length > 0) {
        // Update existing config
        const { error: updateError } = await supabase
          .from('telegram_config')
          .update({ 
            webhook_url: webhook_url,
            webhook_secret: telegramSecretToken,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig[0].id);
        
        if (updateError) {
          console.error("Error updating webhook secret in database:", updateError);
        } else {
          console.log("Updated webhook secret in database");
        }
      } else {
        // Create new config
        const { error: insertError } = await supabase
          .from('telegram_config')
          .insert({
            bot_token: telegramBotToken,
            webhook_url: webhook_url,
            webhook_secret: telegramSecretToken,
          });
          
        if (insertError) {
          console.error("Error inserting webhook secret in database:", insertError);
        } else {
          console.log("Created new config with webhook secret in database");
        }
      }
    }
    
    // Handle different actions
    switch (action) {
      case 'getWebhookInfo':
        try {
          const response = await fetch(`${telegramApi}/getWebhookInfo`);
          const webhookInfo = await response.json();
          
          console.log("Webhook info response:", JSON.stringify(webhookInfo));
          
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
          // First, delete any existing webhook
          console.log("Deleting existing webhook before setting new one");
          await fetch(`${telegramApi}/deleteWebhook`);
          
          // Set allowed updates to filter message types
          const allowedUpdates = ['message', 'edited_message'];
          
          console.log(`Setting webhook to: ${webhook_url} with secret token: ${telegramSecretToken}`);
          
          // Make a direct call to setWebhook with all parameters
          const response = await fetch(`${telegramApi}/setWebhook`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: webhook_url,
              secret_token: telegramSecretToken,
              allowed_updates: allowedUpdates,
              max_connections: 40
            })
          });
          
          const result = await response.json();
          console.log("Set webhook response:", JSON.stringify(result));
          
          return new Response(
            JSON.stringify({ 
              ...result, 
              webhook_secret: telegramSecretToken,
              message: result.ok ? "Webhook set successfully" : "Failed to set webhook" 
            }),
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
          const { data: configData } = await supabase
            .from('telegram_config')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (configData && configData.length > 0) {
            await supabase
              .from('telegram_config')
              .update({ 
                webhook_url: null,
                webhook_secret: null,
                updated_at: new Date().toISOString()
              })
              .eq('id', configData[0].id);
              
            console.log("Cleared webhook URL and secret in database");
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
