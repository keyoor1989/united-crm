
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const telegramBotToken = Deno.env.get('telegram_key') || '';

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const update = await req.json();
    
    // Extract the message from the update
    const message = update.message || update.edited_message;
    if (!message) {
      return new Response('No message in update', { status: 200 });
    }

    const chat_id = message.chat.id.toString();
    const text = message.text || '';
    const isCommand = text.startsWith('/');
    
    // Log the incoming message
    await supabase.from('telegram_message_logs').insert({
      chat_id,
      message_text: text,
      message_type: isCommand ? 'command' : 'message',
      direction: 'incoming',
      processed_status: 'pending'
    });

    // Check if this chat is authorized
    const { data: chatData, error: chatError } = await supabase
      .from('telegram_authorized_chats')
      .select('*')
      .eq('chat_id', chat_id)
      .eq('is_active', true)
      .single();

    if (chatError || !chatData) {
      // This chat is not authorized
      await supabase.from('telegram_message_logs')
        .update({ processed_status: 'unauthorized' })
        .eq('chat_id', chat_id)
        .eq('message_text', text)
        .eq('direction', 'incoming');
        
      await sendTelegramMessage(chat_id, "You are not authorized to use this bot. Please contact the administrator.");
      return new Response('Unauthorized chat', { status: 200 });
    }

    // Process commands
    if (isCommand) {
      const command = text.split(' ')[0].substring(1).toLowerCase();
      
      switch (command) {
        case 'start':
          await handleStartCommand(chat_id);
          break;
        case 'help':
          await handleHelpCommand(chat_id);
          break;
        // Add more commands as needed
        default:
          await sendTelegramMessage(chat_id, "Unknown command. Type /help for available commands.");
          break;
      }
    } else {
      // Default response for non-command messages
      await sendTelegramMessage(chat_id, "I received your message. If you need help, type /help.");
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});

async function sendTelegramMessage(chat_id: string, text: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
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
    
    // Log the outgoing message
    await supabase.from('telegram_message_logs').insert({
      chat_id,
      message_text: text,
      message_type: 'response',
      direction: 'outgoing',
      processed_status: responseData.ok ? 'sent' : 'failed',
    });

    return responseData;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

async function handleStartCommand(chat_id: string) {
  const welcomeMessage = `
Welcome to the Printer Support Bot! 👋

I can help you with:
- Service call updates
- Customer follow-ups
- Inventory alerts

Type /help to see available commands.
`;
  await sendTelegramMessage(chat_id, welcomeMessage);
  
  // Update status in the log
  await supabase.from('telegram_message_logs')
    .update({ processed_status: 'welcome_sent' })
    .eq('chat_id', chat_id)
    .eq('message_text', '/start')
    .eq('direction', 'incoming');
}

async function handleHelpCommand(chat_id: string) {
  const helpMessage = `
Available commands:
/start - Start the bot
/help - Show this help message

You'll also receive notifications based on your preferences.
`;
  await sendTelegramMessage(chat_id, helpMessage);
  
  // Update status in the log
  await supabase.from('telegram_message_logs')
    .update({ processed_status: 'help_sent' })
    .eq('chat_id', chat_id)
    .eq('message_text', '/help')
    .eq('direction', 'incoming');
}
