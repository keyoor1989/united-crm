
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

interface TelegramConfig {
  webhook_secret: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the secret token from the request header
    const secretToken = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
    
    if (!secretToken) {
      console.error('Missing X-Telegram-Bot-Api-Secret-Token header');
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing secret token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch the stored webhook secret from the database
    const { data, error } = await supabase
      .from('telegram_config')
      .select('webhook_secret')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching webhook secret:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch webhook configuration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Verify that we have a stored secret and it matches the incoming request
    if (!data || !data.webhook_secret || data.webhook_secret !== secretToken) {
      console.error('Invalid webhook secret token');
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid secret token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Parse the incoming update from Telegram
    const update = await req.json();
    console.log('Received valid Telegram update:', JSON.stringify(update).substring(0, 200) + '...');
    
    // Forward the update to the telegram-webhook function
    const { data: forwardData, error: forwardError } = await supabase.functions.invoke('telegram-webhook', {
      body: update
    });
    
    if (forwardError) {
      console.error('Error forwarding webhook to telegram-webhook function:', forwardError);
      return new Response(JSON.stringify({ error: 'Failed to process webhook' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Successfully processed and forwarded the webhook
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Unexpected error processing webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
