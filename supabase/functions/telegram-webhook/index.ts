
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const telegramBotToken = Deno.env.get('telegram_key') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received webhook request");
    
    if (!supabaseUrl || !supabaseKey || !telegramBotToken) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let update;
    try {
      update = await req.json();
    } catch (error) {
      console.error("Failed to parse update JSON:", error);
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    // Determine if this is a message or edited message
    const message = update.message || update.edited_message;
    if (!message) {
      console.log("No message in update:", update);
      return new Response('No message in update', { 
        headers: corsHeaders,
        status: 200 
      });
    }

    const chat_id = message.chat.id.toString();
    const text = message.text || '';
    
    console.log(`Received message from chat ${chat_id}: "${text}"`);
    
    // Log the incoming message
    try {
      await supabase.from('telegram_message_logs').insert({
        chat_id,
        message_text: text,
        message_type: text.startsWith('/') ? 'command' : 'message',
        direction: 'incoming',
        processed_status: 'pending'
      });
    } catch (logError) {
      console.error("Failed to log incoming message:", logError);
    }

    // Check if this chat is authorized
    const { data: chatData, error: chatError } = await supabase
      .from('telegram_authorized_chats')
      .select('*')
      .eq('chat_id', chat_id)
      .eq('is_active', true)
      .maybeSingle();

    if (chatError) {
      console.error("Error checking chat authorization:", chatError);
    }

    if (!chatData) {
      console.log("Unauthorized chat attempt:", chat_id);
      
      try {
        await supabase.from('telegram_message_logs')
          .update({ processed_status: 'unauthorized' })
          .eq('chat_id', chat_id)
          .eq('message_text', text)
          .eq('direction', 'incoming');
      } catch (updateError) {
        console.error("Failed to update message status:", updateError);
      }
      
      try {
        await sendTelegramMessage(chat_id, "You are not authorized to use this bot. Please contact the administrator.");
      } catch (sendError) {
        console.error("Failed to send unauthorized message:", sendError);
      }
      
      return new Response('Unauthorized chat', { 
        headers: corsHeaders,
        status: 200 
      });
    }

    // Handle commands and messages
    try {
      if (text.startsWith('/')) {
        console.log("Handling command:", text);
        await handleSlashCommands(chat_id, text);
      } 
      else if (text.toLowerCase().includes('add customer') || 
               text.toLowerCase().includes('new customer')) {
        console.log("Handling add customer command");
        await handleCommand(chat_id, 'add_customer', text);
      }
      else if (text.toLowerCase().includes('lookup') || 
               text.match(/^\d{10}$/) || 
               text.toLowerCase().includes('find customer')) {
        console.log("Handling customer lookup");
        await handleCommand(chat_id, 'lookup_customer', text);
      }
      else if (text.toLowerCase() === 'daily report' || 
               text.toLowerCase() === 'report' ||
               text.toLowerCase() === 'today\'s report') {
        console.log("Handling daily report request");
        await handleCommand(chat_id, 'report');
      }
      else {
        console.log("Unknown command, sending help message");
        await sendTelegramMessage(chat_id, 
          "I didn't understand that command. Here's what I can help you with:\n\n" +
          "• Add Customer [details]\n" +
          "• Lookup [mobile number]\n" +
          "• Daily Report\n\n" +
          "Type /help for more information."
        );
      }
    } catch (processingError) {
      console.error("Error processing message:", processingError);
      
      try {
        await sendTelegramMessage(chat_id, "Sorry, there was an error processing your request. Please try again later.");
      } catch (sendError) {
        console.error("Failed to send error message:", sendError);
      }
    }

    return new Response('OK', { 
      headers: corsHeaders,
      status: 200 
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(`Error: ${error.message}`, { 
      headers: corsHeaders,
      status: 500 
    });
  }
});

async function sendTelegramMessage(chat_id: string, text: string, parse_mode: string = 'HTML') {
  try {
    console.log(`Sending message to chat ${chat_id}: "${text.substring(0, 50)}..."`);
    
    if (!telegramBotToken) {
      throw new Error("Telegram bot token is not configured");
    }
    
    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram API error: ${errorText}`);
    }
    
    const responseData = await response.json();
    
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('telegram_message_logs').insert({
        chat_id,
        message_text: text.substring(0, 500),
        message_type: 'response',
        direction: 'outgoing',
        processed_status: responseData.ok ? 'sent' : 'failed',
      });
    } catch (logError) {
      console.error("Failed to log outgoing message:", logError);
    }

    if (!responseData.ok) {
      console.error("Error from Telegram API:", responseData);
      throw new Error(`Telegram API error: ${JSON.stringify(responseData)}`);
    }

    return responseData;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

async function handleSlashCommands(chat_id: string, text: string) {
  const command = text.split(' ')[0].substring(1).toLowerCase();
  
  console.log("Processing slash command:", command);
  
  switch (command) {
    case 'start':
      await sendTelegramMessage(chat_id, `
Welcome to the Printer CRM Assistant! 👋

I can help you with:
• Adding new customers
• Looking up customer information
• Getting daily reports

Type /help to see more details on how to use these features.
      `);
      break;
      
    case 'help':
      // Use the process-command function for help content
      await handleCommand(chat_id, 'help');
      break;
      
    case 'report':
      console.log("Handling /report command");
      await handleCommand(chat_id, 'report');
      break;
      
    default:
      await sendTelegramMessage(chat_id, "Unknown command. Type /help for available commands.");
      break;
  }
}

async function handleCommand(chat_id: string, command_type: string, text?: string) {
  try {
    console.log(`Handling command type: ${command_type}, text: ${text || '(none)'}`);
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials are not configured");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase.functions.invoke('telegram-process-command', {
      body: {
        chat_id,
        command_type,
        text
      }
    });
    
    if (error) {
      console.error(`Error processing ${command_type} command:`, error);
      await sendTelegramMessage(
        chat_id, 
        `❌ Sorry, there was an error processing your request: ${error.message || 'Unknown error'}`
      );
      return;
    }
    
    if (data && data.message) {
      await sendTelegramMessage(chat_id, data.message, 'HTML');
    } else if (!data || !data.success) {
      await sendTelegramMessage(
        chat_id, 
        `❌ Sorry, there was an error processing your request: ${data?.error || 'Unknown error'}`
      );
    }
  } catch (e) {
    console.error(`Error in handleCommand (${command_type}):`, e);
    await sendTelegramMessage(
      chat_id, 
      `❌ An unexpected error occurred while processing your request: ${e.message || 'Unknown error'}`
    );
  }
}
