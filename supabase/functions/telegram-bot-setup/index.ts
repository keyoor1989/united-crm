
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
    let requestData;
    try {
      requestData = await req.json();
      console.log(`Received request with action: ${requestData?.action}`);
    } catch (error) {
      console.error("Error parsing request JSON:", error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    const { action, webhook_url } = requestData;
    
    if (!action) {
      console.error("Missing required parameter: action");
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
        console.error("Missing required parameter: webhook_url");
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
      
      try {
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
        
        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text();
          console.error("Error from Telegram API:", errorText);
          return new Response(
            JSON.stringify({ error: `Telegram API error: ${errorText}` }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }
        
        const webhookData = await webhookResponse.json();
        console.log("Webhook setup response:", webhookData);
        
        if (webhookData.ok) {
          // Update webhook URL and secret in DB
          try {
            const { data: configData, error: configError } = await supabase
              .from('telegram_config')
              .select('id')
              .limit(1)
              .single();
              
            if (configError) {
              console.error("Error fetching config ID:", configError);
              // Still return success to client but with warning
              return new Response(
                JSON.stringify({ ...webhookData, warning: "Webhook set on Telegram but database update failed" }),
                { 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  status: 200
                }
              );
            }
            
            const { error: updateError } = await supabase
              .from('telegram_config')
              .update({ 
                webhook_url, 
                webhook_secret: webhookSecret,
                updated_at: new Date().toISOString() 
              })
              .eq('id', configData.id);
              
            if (updateError) {
              console.error("Error updating config:", updateError);
              // Still return success to client but with warning
              return new Response(
                JSON.stringify({ ...webhookData, warning: "Webhook set on Telegram but database update failed" }),
                { 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  status: 200
                }
              );
            }
          } catch (dbError) {
            console.error("Database error:", dbError);
            // Still return success to client but with warning
            return new Response(
              JSON.stringify({ ...webhookData, warning: "Webhook set on Telegram but database update failed" }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
              }
            );
          }
        }
        
        return new Response(
          JSON.stringify(webhookData),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      } catch (error) {
        console.error("Error setting webhook:", error);
        return new Response(
          JSON.stringify({ error: `Error setting webhook: ${error.message}` }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        );
      }
    }
    
    // Delete webhook
    if (action === 'deleteWebhook') {
      console.log("Deleting webhook");
      
      try {
        const webhookResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/deleteWebhook?drop_pending_updates=true`, {
          method: 'POST'
        });
        
        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text();
          console.error("Error from Telegram API:", errorText);
          return new Response(
            JSON.stringify({ error: `Telegram API error: ${errorText}` }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }
        
        const webhookData = await webhookResponse.json();
        console.log("Webhook deletion response:", webhookData);
        
        if (webhookData.ok) {
          // Update webhook URL in DB
          try {
            const { data: configData, error: configError } = await supabase
              .from('telegram_config')
              .select('id')
              .limit(1)
              .single();
              
            if (configError) {
              console.error("Error fetching config ID:", configError);
              // Still return success to client but with warning
              return new Response(
                JSON.stringify({ ...webhookData, warning: "Webhook deleted on Telegram but database update failed" }),
                { 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  status: 200
                }
              );
            }
            
            const { error: updateError } = await supabase
              .from('telegram_config')
              .update({ 
                webhook_url: null,
                webhook_secret: null,
                updated_at: new Date().toISOString() 
              })
              .eq('id', configData.id);
              
            if (updateError) {
              console.error("Error updating config:", updateError);
              // Still return success to client but with warning
              return new Response(
                JSON.stringify({ ...webhookData, warning: "Webhook deleted on Telegram but database update failed" }),
                { 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  status: 200
                }
              );
            }
          } catch (dbError) {
            console.error("Database error:", dbError);
            // Still return success to client but with warning
            return new Response(
              JSON.stringify({ ...webhookData, warning: "Webhook deleted on Telegram but database update failed" }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
              }
            );
          }
        }
        
        return new Response(
          JSON.stringify(webhookData),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      } catch (error) {
        console.error("Error deleting webhook:", error);
        return new Response(
          JSON.stringify({ error: `Error deleting webhook: ${error.message}` }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        );
      }
    }
    
    // Get webhook info
    if (action === 'getWebhookInfo') {
      console.log("Getting webhook info");
      
      try {
        const webhookResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getWebhookInfo`);
        
        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text();
          console.error("Error from Telegram API:", errorText);
          return new Response(
            JSON.stringify({ error: `Telegram API error: ${errorText}` }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }
        
        const webhookData = await webhookResponse.json();
        console.log("Webhook info:", webhookData);
        
        return new Response(
          JSON.stringify(webhookData),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      } catch (error) {
        console.error("Error getting webhook info:", error);
        return new Response(
          JSON.stringify({ error: `Error getting webhook info: ${error.message}` }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        );
      }
    }
    
    // Set commands
    if (action === 'setCommands') {
      console.log("Setting bot commands");
      
      try {
        const commands = [
          { command: 'start', description: 'Start using the bot' },
          { command: 'help', description: 'Get help with using the bot' },
          { command: 'report', description: 'Get a daily business report' }
        ];
        
        console.log("Registering commands:", commands);
        
        const commandResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/setMyCommands`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ commands }),
        });
        
        if (!commandResponse.ok) {
          const errorText = await commandResponse.text();
          console.error("Error from Telegram API:", errorText);
          return new Response(
            JSON.stringify({ error: `Telegram API error: ${errorText}` }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }
        
        const responseData = await commandResponse.json();
        console.log("Command registration response:", responseData);
        
        return new Response(
          JSON.stringify(responseData),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      } catch (error) {
        console.error("Error setting commands:", error);
        return new Response(
          JSON.stringify({ error: `Error setting commands: ${error.message}` }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  } catch (error) {
    console.error("Unhandled error in telegram-bot-setup:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
