
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

const BOT_TOKEN = Deno.env.get('telegram_key') || '';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Generate a random webhook secret
function generateSecret() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

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

async function setWebhook(url: string, supabase: any): Promise<Response> {
  try {
    // Get or create a webhook secret
    let webhookSecret = '';
    const { data: configData, error: configError } = await supabase
      .from('telegram_config')
      .select('id, webhook_secret')
      .maybeSingle();
    
    if (configError) {
      console.error("Error fetching config:", configError);
    }
    
    if (!configData?.webhook_secret) {
      // Generate a new secret
      webhookSecret = generateSecret();
      console.log("Generated new webhook secret (first 5 chars):", webhookSecret.substring(0, 5) + "...");
      
      // Update the config with the new secret
      const { error: updateError } = await supabase
        .from('telegram_config')
        .upsert({ webhook_secret: webhookSecret })
        .select();
      
      if (updateError) {
        console.error("Error updating webhook secret:", updateError);
      }
    } else {
      webhookSecret = configData.webhook_secret;
      console.log("Using existing webhook secret");
    }
    
    // Set allowed updates to messages and callback queries only
    const allowedUpdates = ['message', 'callback_query'];
    
    // Call Telegram API to set the webhook
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
    
    console.log(`Webhook set response:`, data);
    
    // Update the webhook_url in the database if successful
    if (data.ok) {
      const { error: urlUpdateError } = await supabase
        .from('telegram_config')
        .upsert({ webhook_url: url })
        .select();
      
      if (urlUpdateError) {
        console.error("Error updating webhook URL:", urlUpdateError);
        data.warning = "Webhook set but failed to update database";
      }
    }
    
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

async function deleteWebhook(supabase: any): Promise<Response> {
  try {
    const response = await fetch(`${TELEGRAM_API}/deleteWebhook`);
    const data = await response.json();
    
    // Update the database to remove the webhook URL if successful
    if (data.ok) {
      const { error: updateError } = await supabase
        .from('telegram_config')
        .update({ webhook_url: null })
        .eq('id', 1);
      
      if (updateError) {
        console.error("Error updating database after webhook deletion:", updateError);
        data.warning = "Webhook deleted but failed to update database";
      }
    }
    
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
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase credentials' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
