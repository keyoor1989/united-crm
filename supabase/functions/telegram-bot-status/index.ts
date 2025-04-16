
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
      return new Response(
        JSON.stringify({ error: 'Telegram bot token is not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const telegramApi = `https://api.telegram.org/bot${telegramBotToken}`;
    
    // Get bot information to verify the token
    const botInfoResponse = await fetch(`${telegramApi}/getMe`);
    const botInfo = await botInfoResponse.json();
    
    // Get webhook information
    const webhookResponse = await fetch(`${telegramApi}/getWebhookInfo`);
    const webhookInfo = await webhookResponse.json();
    
    // Get authorized chats
    const { data: chats, error: chatError } = await supabase
      .from('telegram_authorized_chats')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Get message logs
    const { data: logs, error: logError } = await supabase
      .from('telegram_message_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Gather all diagnostics
    const diagnostics = {
      botInfo,
      webhookInfo,
      chats: chats || [],
      logs: logs || [],
      errors: {
        chatError: chatError ? chatError.message : null,
        logError: logError ? logError.message : null,
      },
      timestamp: new Date().toISOString()
    };
    
    return new Response(
      JSON.stringify(diagnostics),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error in telegram-bot-status:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
