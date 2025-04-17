
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

interface TelegramMessagePayload {
  chat_id: string;
  text: string;
  parse_mode?: "HTML" | "Markdown";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Telegram Bot token from environment variables
    const BOT_TOKEN = Deno.env.get('telegram_key') || '';
    
    if (!BOT_TOKEN) {
      console.error('Missing Telegram Bot token in environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing Telegram Bot token' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse the request body to get message details
    const { chat_id, text, parse_mode = "HTML" }: TelegramMessagePayload = await req.json();
    
    if (!chat_id || !text) {
      return new Response(JSON.stringify({ error: 'Missing required parameters: chat_id or text' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Define Telegram API endpoint
    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
    
    // Send message to Telegram API
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id,
        text,
        parse_mode
      })
    });

    const responseData = await response.json();
    const isSuccess = response.ok && responseData.ok;

    // Log the outgoing message to the database
    const { error: logError } = await supabase
      .from('telegram_message_logs')
      .insert({
        chat_id,
        message_text: text,
        message_type: 'response',
        direction: 'outgoing',
        processed_status: isSuccess ? 'processed' : 'error',
        error_message: isSuccess ? null : JSON.stringify(responseData)
      });

    if (logError) {
      console.error('Error logging message:', logError);
    }

    // Return the Telegram API response
    if (!isSuccess) {
      console.error('Error sending message to Telegram:', responseData);
      return new Response(JSON.stringify({ 
        error: 'Failed to send message to Telegram', 
        details: responseData 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Message sent successfully',
      response: responseData 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Unexpected error processing request:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
