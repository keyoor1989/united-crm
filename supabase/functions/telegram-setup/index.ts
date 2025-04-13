
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get the Telegram bot token from environment variables
const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, webhook_url, chat_id } = body;

    if (!telegramBotToken) {
      return new Response(JSON.stringify({ error: 'Telegram bot token not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get current webhook status from Telegram
    if (action === 'getWebhookInfo') {
      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getWebhookInfo`);
      const webhookInfo = await response.json();
      
      return new Response(JSON.stringify(webhookInfo), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Set webhook
    if (action === 'setWebhook' && webhook_url) {
      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhook_url,
          allowed_updates: ['message'],
        }),
      });
      
      const webhookResult = await response.json();
      
      if (webhookResult.ok) {
        // Save the webhook URL to the database
        await supabase
          .from('telegram_config')
          .upsert({
            bot_token: telegramBotToken,
            webhook_url: webhook_url,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'bot_token' });
      }
      
      return new Response(JSON.stringify(webhookResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete webhook
    if (action === 'deleteWebhook') {
      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/deleteWebhook`);
      const result = await response.json();
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Authorize a chat ID
    if (action === 'authorizeChat' && chat_id) {
      // Check if the chat ID already exists
      const { data: existingChat } = await supabase
        .from('telegram_authorized_chats')
        .select('*')
        .eq('chat_id', chat_id)
        .single();
      
      if (existingChat) {
        // Update existing chat
        await supabase
          .from('telegram_authorized_chats')
          .update({
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('chat_id', chat_id);
      } else {
        // Insert new chat
        await supabase
          .from('telegram_authorized_chats')
          .insert({
            chat_id: chat_id,
            chat_name: body.chat_name || 'Unknown',
            is_active: true,
          });
        
        // Also insert default notification preferences
        await supabase
          .from('telegram_notification_preferences')
          .insert({
            chat_id: chat_id,
            service_calls: true,
            customer_followups: true,
            inventory_alerts: false,
          });
      }
      
      return new Response(JSON.stringify({ ok: true, message: 'Chat authorized successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Unauthorized or incorrect action
    return new Response(JSON.stringify({ error: 'Invalid action or missing parameters' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in telegram-setup function:', error);
    
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
