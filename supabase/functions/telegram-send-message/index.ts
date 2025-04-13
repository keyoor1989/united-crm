
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { chat_id, text } = await req.json();

    if (!chat_id || !text) {
      return new Response(
        JSON.stringify({ error: 'Chat ID and message text are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Check if this chat is authorized
    const { data: chatData, error: chatError } = await supabase
      .from('telegram_authorized_chats')
      .select('*')
      .eq('chat_id', chat_id)
      .eq('is_active', true)
      .single();

    if (chatError || !chatData) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized chat or chat not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Send message to Telegram
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id,
        text,
        parse_mode: 'HTML',
      }),
    });

    const responseData = await response.json();

    // Log the message in our database
    await supabase.from('telegram_message_logs').insert({
      chat_id,
      message_text: text,
      message_type: 'manual',
      direction: 'outgoing',
      processed_status: responseData.ok ? 'sent' : 'failed',
    });

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
