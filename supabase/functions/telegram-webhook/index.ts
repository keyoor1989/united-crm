
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

const BOT_TOKEN = Deno.env.get('telegram_key') || '';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Helper function to send Telegram message
async function sendTelegramMessage(chat_id: string, text: string): Promise<Response> {
  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id,
      text,
      parse_mode: 'HTML'
    })
  });

  return response;
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
        status: 500
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse Telegram update
    const update = await req.json();
    const message = update.message;
    
    if (!message || !message.text || !message.chat) {
      return new Response(JSON.stringify({ error: 'Invalid message format' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const chat_id = message.chat.id.toString();
    const message_text = message.text || '';

    // Log incoming message
    await supabase.from('telegram_message_logs').insert({
      chat_id,
      message_text,
      message_type: message_text.startsWith('/') ? 'command' : 'message',
      direction: 'incoming'
    });

    // Check chat authorization
    const { data: authorizedChat, error: authError } = await supabase
      .from('telegram_authorized_chats')
      .select('*')
      .eq('chat_id', chat_id)
      .eq('is_active', true)
      .maybeSingle();

    if (authError || !authorizedChat) {
      await sendTelegramMessage(
        chat_id, 
        "❌ You are not authorized to use this bot. Please contact the administrator."
      );
      return new Response(JSON.stringify({ error: 'Unauthorized chat' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      });
    }

    // Process different command types
    let processResult;
    switch (message_text.toLowerCase()) {
      case '/start':
        await sendTelegramMessage(
          chat_id, 
          "👋 Welcome to the CRM Bot! Type /help to see available commands."
        );
        break;

      case '/report':
        processResult = await supabase.functions.invoke('telegram-process-command', {
          body: { chat_id, command_type: 'report' }
        });
        if (processResult.data) {
          await sendTelegramMessage(chat_id, processResult.data.message || 'Report generated');
        }
        break;

      default:
        // Check for add customer command or other dynamic processing
        if (message_text.toLowerCase().includes('add customer') || /^\d+$/.test(message_text)) {
          processResult = await supabase.functions.invoke('telegram-process-command', {
            body: { 
              chat_id, 
              command_type: 'add_customer', 
              text: message_text 
            }
          });
          if (processResult.data) {
            await sendTelegramMessage(chat_id, processResult.data.message || 'Customer processing result');
          }
        } else {
          // Unrecognized command
          await sendTelegramMessage(
            chat_id, 
            "❓ Unrecognized command. Type /help for a list of available commands."
          );
        }
        break;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
