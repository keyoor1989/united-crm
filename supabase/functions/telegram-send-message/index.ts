
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
    
    // Parse request body
    const { chat_id, text, parse_mode = "HTML" } = await req.json();
    
    if (!chat_id || !text) {
      return new Response(
        JSON.stringify({ error: 'chat_id and text are required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    // Check if the chat is authorized
    const { data: chatData, error: chatError } = await supabase
      .from('telegram_authorized_chats')
      .select('*')
      .eq('chat_id', chat_id)
      .eq('is_active', true)
      .single();
    
    if (chatError || !chatData) {
      console.log("Unauthorized chat or chat not active:", chat_id);
      return new Response(
        JSON.stringify({ error: 'Unauthorized chat or chat not active' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403
        }
      );
    }
    
    // Send message
    console.log(`Sending message to chat ${chat_id} using token from environment variables`);
    
    const response = await fetch(`${telegramApi}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id,
        text,
        parse_mode,
      }),
    });
    
    const result = await response.json();
    console.log("Send message response:", JSON.stringify(result));
    
    // Log the message
    await supabase.from('telegram_message_logs').insert({
      chat_id,
      message_text: text,
      message_type: 'test_message',
      direction: 'outgoing',
      processed_status: result.ok ? 'sent' : 'failed',
    });
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error in telegram-send-message:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
