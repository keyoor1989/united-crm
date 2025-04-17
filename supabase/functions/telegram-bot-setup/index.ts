
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
        .update({ webhook_secret: webhookSecret })
        .eq('id', configData?.id || 1);
      
      if (updateError) {
        console.error("Error updating webhook secret:", updateError);
      }
    } else {
      webhookSecret = configData.webhook_secret;
      console.log("Using existing webhook secret");
    }
    
    // Set allowed updates to messages and edited messages only
    const allowedUpdates = ['message', 'edited_message', 'callback_query'];
    
    // Build the setWebhook URL with parameters
    const setWebhookUrl = new URL(`${TELEGRAM_API}/setWebhook`);
    setWebhookUrl.searchParams.append('url', url);
    setWebhookUrl.searchParams.append('allowed_updates', JSON.stringify(allowedUpdates));
    
    // Add secret_token parameter if we have a secret
    if (webhookSecret) {
      setWebhookUrl.searchParams.append('secret_token', webhookSecret);
    }
    
    // Use Telegram's setWebhook API
    const response = await fetch(setWebhookUrl.toString());
    const data = await response.json();
    
    console.log(`Webhook set response:`, data);
    
    // Update the webhook_url in the database
    if (data.ok) {
      const { error: urlUpdateError } = await supabase
        .from('telegram_config')
        .update({ webhook_url: url })
        .eq('id', configData?.id || 1);
      
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
    
    // Update the database to remove the webhook URL
    if (data.ok) {
      const { error: updateError } = await supabase
        .from('telegram_config')
        .update({ webhook_url: null })
        .eq('bot_token', BOT_TOKEN);
      
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

async function setCommands(): Promise<Response> {
  try {
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
    
    const response = await fetch(`${TELEGRAM_API}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands })
    });
    
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
      case 'setCommands':
        return await setCommands();
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
