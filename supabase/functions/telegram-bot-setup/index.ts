
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
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
    console.error("Error in getWebhookInfo:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

async function setWebhook(url: string, supabase: any): Promise<Response> {
  try {
    console.log(`Setting webhook to URL: ${url}`);
    
    // Generate a new secure webhook secret using crypto.randomUUID()
    const webhookSecret = crypto.randomUUID();
    console.log(`Generated new webhook secret: ${webhookSecret.substring(0, 8)}...`);
    
    // Set allowed updates to messages and callback queries only
    const allowedUpdates = ['message', 'callback_query'];
    
    // First, clean up any configurations with null webhook_url
    console.log("Cleaning up null webhook_url entries from the database");
    const { error: cleanupError } = await supabase
      .from('telegram_config')
      .delete()
      .is('webhook_url', null);
    
    if (cleanupError) {
      console.error("Error cleaning up null webhook_url entries:", cleanupError);
      // Continue despite cleanup error
    }
    
    // Insert new configuration with the webhook URL and secret
    console.log("Storing new webhook configuration in database");
    const { data: configData, error: upsertError } = await supabase
      .from('telegram_config')
      .insert({ 
        webhook_url: url, 
        webhook_secret: webhookSecret 
      })
      .select();
    
    if (upsertError) {
      console.error("Error storing webhook configuration:", upsertError);
      return new Response(JSON.stringify({ 
        error: "Failed to store webhook configuration",
        details: upsertError
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    console.log("Successfully stored webhook configuration in database:", configData);
    
    // Call Telegram API to set the webhook with the new secret token
    console.log("Calling Telegram API to set webhook with secret token");
    const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: url,
        secret_token: webhookSecret,
        allowed_updates: allowedUpdates
      })
    });
    
    const data = await response.json();
    console.log(`Telegram setWebhook response:`, data);
    
    if (data.ok) {
      return new Response(JSON.stringify({
        success: true,
        message: "Webhook set successfully with secure token",
        data: data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      // If Telegram API fails, remove the config we just added
      console.error("Telegram API failed, rolling back database changes");
      const { error: cleanupError } = await supabase
        .from('telegram_config')
        .delete()
        .eq('webhook_url', url);
        
      if (cleanupError) {
        console.error("Error removing failed webhook config:", cleanupError);
      }
      
      return new Response(JSON.stringify({ 
        error: "Failed to set webhook with Telegram API", 
        telegram_response: data 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  } catch (error) {
    console.error(`Error setting webhook:`, error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

async function deleteWebhook(supabase: any): Promise<Response> {
  try {
    console.log("Deleting webhook from Telegram");
    const response = await fetch(`${TELEGRAM_API}/deleteWebhook`);
    const data = await response.json();
    
    if (data.ok) {
      // Remove all telegram_config entries
      console.log("Removing webhook configurations from database");
      const { error: deleteError } = await supabase
        .from('telegram_config')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
      
      if (deleteError) {
        console.error("Error removing webhook configurations:", deleteError);
        data.warning = "Webhook deleted from Telegram but failed to update database";
      } else {
        console.log("Successfully removed webhook configurations from database");
      }
    }
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error in deleteWebhook:", error);
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
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return new Response(JSON.stringify({ error: 'Missing Supabase credentials' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { action, webhook_url } = await req.json();
    console.log(`Processing action: ${action}`);

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
        return await setWebhook(webhook_url, supabase);
      case 'deleteWebhook':
        return await deleteWebhook(supabase);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
