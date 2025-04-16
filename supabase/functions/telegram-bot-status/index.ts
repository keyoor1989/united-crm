
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
    
    console.log("Using Telegram bot token from environment variables:", telegramBotToken.substring(0, 5) + "...");
    
    // Get bot information to verify the token
    const botInfoResponse = await fetch(`${telegramApi}/getMe`);
    const botInfo = await botInfoResponse.json();
    
    console.log("Bot info response:", JSON.stringify(botInfo));
    
    // Get webhook information
    const webhookResponse = await fetch(`${telegramApi}/getWebhookInfo`);
    const webhookInfo = await webhookResponse.json();
    
    console.log("Webhook info response:", JSON.stringify(webhookInfo));
    
    // Update the database with the correct token if needed
    try {
      const { data: configData } = await supabase
        .from('telegram_config')
        .select('*')
        .limit(1);
        
      if (configData && configData.length > 0 && configData[0].bot_token !== telegramBotToken) {
        await supabase
          .from('telegram_config')
          .update({ 
            bot_token: telegramBotToken,
            updated_at: new Date().toISOString()
          })
          .eq('id', configData[0].id);
          
        console.log("Updated token in database");
      }
    } catch (dbError) {
      console.error("Error updating token in database:", dbError);
    }
    
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
