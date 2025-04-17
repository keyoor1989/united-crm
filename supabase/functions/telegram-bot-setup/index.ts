
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { decode } from "https://deno.land/std@0.177.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get needed environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const telegramBotToken = Deno.env.get('telegram_key') || '';
    
    if (!telegramBotToken) {
      console.error("Missing Telegram bot token in environment variables");
      return new Response(
        JSON.stringify({ error: 'Telegram bot token is not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    const { action } = requestBody;
    console.log("Received request with action:", action);
    
    // Base URL for Telegram Bot API
    const telegramApi = `https://api.telegram.org/bot${telegramBotToken}`;
    console.log("Using bot token (first 5 chars):", telegramBotToken.substring(0, 5) + "...");
    
    // Switch based on action
    switch (action) {
      case 'setWebhook': {
        const { webhook_url } = requestBody;
        
        if (!webhook_url) {
          return new Response(
            JSON.stringify({ error: 'webhook_url is required' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          );
        }
        
        // Get webhook secret from the database
        const { data: configData, error: configError } = await supabase
          .from('telegram_config')
          .select('webhook_secret')
          .maybeSingle();
          
        if (configError) {
          console.error("Error fetching webhook secret:", configError);
        }
        
        const webhookSecret = configData?.webhook_secret || '';
        
        // Set webhook with the secret token
        console.log(`Setting webhook URL to ${webhook_url}`);
        
        const setWebhookUrl = new URL(`${telegramApi}/setWebhook`);
        setWebhookUrl.searchParams.append('url', webhook_url);
        
        // Only set a secret token if we have one
        if (webhookSecret) {
          console.log("Using stored webhook secret");
          setWebhookUrl.searchParams.append('secret_token', webhookSecret);
        } else {
          console.warn("No webhook secret found in database");
        }
        
        // Log the actual URL we're calling (without sensitive parts)
        const safeUrl = setWebhookUrl.toString().replace(telegramBotToken, "REDACTED_TOKEN");
        console.log("Calling Telegram API with URL:", safeUrl);
        
        // Make the request to Telegram Bot API
        try {
          const response = await fetch(setWebhookUrl);
          const result = await response.json();
          
          console.log("Set webhook response:", JSON.stringify(result));
          
          // Update webhook_url in the database
          if (result.ok) {
            const { error: updateError } = await supabase
              .from('telegram_config')
              .update({ webhook_url })
              .eq('bot_token', telegramBotToken);
              
            if (updateError) {
              console.error("Error updating webhook URL in database:", updateError);
              return new Response(
                JSON.stringify({ 
                  ...result, 
                  warning: 'Webhook set but failed to update database' 
                }),
                { 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
              );
            }
            
            console.log("Successfully set webhook and updated database");
          }
          
          return new Response(
            JSON.stringify(result),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        } catch (error) {
          console.error("Error setting webhook:", error);
          return new Response(
            JSON.stringify({ 
              ok: false, 
              description: `Failed to set webhook: ${error.message}` 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }
      }
      
      case 'deleteWebhook': {
        console.log("Deleting webhook");
        
        try {
          const response = await fetch(`${telegramApi}/deleteWebhook`);
          const result = await response.json();
          
          console.log("Delete webhook response:", JSON.stringify(result));
          
          // Update webhook_url in the database if deletion was successful
          if (result.ok) {
            const { error: updateError } = await supabase
              .from('telegram_config')
              .update({ webhook_url: null })
              .eq('bot_token', telegramBotToken);
              
            if (updateError) {
              console.error("Error updating webhook URL in database:", updateError);
              return new Response(
                JSON.stringify({ 
                  ...result, 
                  warning: 'Webhook deleted but failed to update database' 
                }),
                { 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
              );
            }
            
            console.log("Successfully deleted webhook and updated database");
          }
          
          return new Response(
            JSON.stringify(result),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        } catch (error) {
          console.error("Error deleting webhook:", error);
          return new Response(
            JSON.stringify({ 
              ok: false, 
              description: `Failed to delete webhook: ${error.message}` 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }
      }
      
      case 'getWebhookInfo': {
        console.log("Getting webhook info");
        
        try {
          const response = await fetch(`${telegramApi}/getWebhookInfo`);
          const result = await response.json();
          
          console.log("Webhook info:", JSON.stringify(result, null, 2));
          
          return new Response(
            JSON.stringify(result),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        } catch (error) {
          console.error("Error getting webhook info:", error);
          return new Response(
            JSON.stringify({ 
              ok: false, 
              description: `Failed to get webhook info: ${error.message}` 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }
      }
      
      case 'setCommands': {
        console.log("Setting bot commands");
        
        const commands = [
          {
            command: "help",
            description: "Get help information"
          },
          {
            command: "status",
            description: "Get bot status information"
          }
        ];
        
        try {
          const response = await fetch(`${telegramApi}/setMyCommands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commands })
          });
          
          const result = await response.json();
          console.log("Set commands response:", JSON.stringify(result));
          
          return new Response(
            JSON.stringify(result),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        } catch (error) {
          console.error("Error setting commands:", error);
          return new Response(
            JSON.stringify({ 
              ok: false, 
              description: `Failed to set commands: ${error.message}` 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }
      }
      
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
    }
  } catch (error) {
    console.error("Unhandled error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
