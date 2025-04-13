
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { parseCustomerCommand } from "../../../src/utils/chatCommands/customerParser.ts";
import { checkDuplicateCustomer, createNewCustomer } from "../../../src/utils/chatCommands/customerParser.ts";

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

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  try {
    // Parse the request body
    const update = await req.json();
    console.log('Received Telegram update:', JSON.stringify(update, null, 2));

    // Check if this is a message
    if (!update.message) {
      return new Response(JSON.stringify({ ok: true, message: 'No message in update' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const chatId = update.message.chat.id.toString();
    const messageText = update.message.text || '';
    const username = update.message.from.username || '';
    const firstName = update.message.from.first_name || '';
    const lastName = update.message.from.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();

    // Log the incoming message
    await supabase
      .from('telegram_message_logs')
      .insert({
        chat_id: chatId,
        message_text: messageText,
        message_type: 'text',
        direction: 'incoming',
        processed_status: 'received'
      });

    // Check if the chat ID is authorized
    const { data: authorizedChat, error: authError } = await supabase
      .from('telegram_authorized_chats')
      .select('*')
      .eq('chat_id', chatId)
      .eq('is_active', true)
      .single();

    if (authError || !authorizedChat) {
      // Chat is not authorized
      const chatName = username || fullName || 'Unknown';
      
      // Store the unauthorized chat for potential later approval
      await supabase
        .from('telegram_message_logs')
        .update({ processed_status: 'unauthorized' })
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(1);

      // Send a message to the unauthorized chat
      await sendTelegramMessage(chatId, 'You are not authorized to use this bot. Your request has been logged for admin approval.');
      
      return new Response(JSON.stringify({ ok: true, authorized: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process "Add Customer" command
    if (messageText.toLowerCase().startsWith('add customer') || 
        messageText.toLowerCase().startsWith('new customer') ||
        messageText.toLowerCase().startsWith('create customer') ||
        messageText.toLowerCase().startsWith('new lead')) {
      return await handleAddCustomerCommand(chatId, messageText);
    }

    // Process help command
    if (messageText.toLowerCase() === '/help' || messageText.toLowerCase() === 'help') {
      return await handleHelpCommand(chatId);
    }

    // Default response for unrecognized commands
    await sendTelegramMessage(chatId, 'I didn\'t understand that command. Type /help to see available commands.');
    
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleAddCustomerCommand(chatId: string, messageText: string) {
  try {
    // Parse the customer information using our existing customerParser
    const parsedCommand = parseCustomerCommand(messageText);
    
    // Update the message log status
    await supabase
      .from('telegram_message_logs')
      .update({ 
        processed_status: parsedCommand.isValid ? 'valid_customer' : 'invalid_customer' 
      })
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(1);

    // Check if we have enough information
    if (!parsedCommand.isValid) {
      const missingFields = parsedCommand.missingFields.join(', ');
      await sendTelegramMessage(
        chatId, 
        `⚠️ Not enough information to add the customer. Missing: ${missingFields}.\n\n` +
        'Format should be:\n' +
        'Add Customer: John Doe\n' +
        'Number: 9876543210\n' +
        'From: Mumbai\n' +
        'Email: john@example.com (optional)\n' +
        'Interested in: Printer (optional)'
      );
      
      return new Response(JSON.stringify({ ok: true, valid: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for duplicate customer
    const { data: customers } = await supabase
      .from('customers')
      .select('*');

    const duplicateCustomer = checkDuplicateCustomer(parsedCommand.phone, customers || []);

    if (duplicateCustomer) {
      await sendTelegramMessage(
        chatId,
        `⚠️ Customer with phone ${parsedCommand.phone} already exists in the database.\n\n` +
        `Name: ${duplicateCustomer.name}\n` +
        `Location: ${duplicateCustomer.location}\n` +
        `Status: ${duplicateCustomer.status}`
      );
      
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create the new customer
    const newCustomer = createNewCustomer(parsedCommand);
    
    // Insert into database
    const { data: createdCustomer, error } = await supabase
      .from('customers')
      .insert({
        id: newCustomer.id,
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email,
        area: newCustomer.location,
        lead_status: 'New',
        source: 'Telegram',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      await sendTelegramMessage(chatId, `❌ Failed to add customer: ${error.message}`);
      
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If the customer is interested in a product, add it as a machine
    if (parsedCommand.product) {
      await supabase
        .from('customer_machines')
        .insert({
          customer_id: createdCustomer.id,
          machine_name: parsedCommand.product,
          is_external_purchase: true
        });
    }

    // Send confirmation message
    await sendTelegramMessage(
      chatId,
      `✅ Customer ${newCustomer.name} added successfully to CRM!\n\n` +
      `Phone: ${newCustomer.phone}\n` +
      `Location: ${newCustomer.location}\n` +
      (newCustomer.email ? `Email: ${newCustomer.email}\n` : '') +
      (parsedCommand.product ? `Interested in: ${parsedCommand.product}` : '')
    );

    // Log the successful customer creation
    await supabase
      .from('telegram_message_logs')
      .update({ processed_status: 'customer_created' })
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(1);

    return new Response(JSON.stringify({ ok: true, customer: createdCustomer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error handling add customer command:', error);
    await sendTelegramMessage(chatId, `❌ An error occurred while processing your request: ${error.message}`);
    
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleHelpCommand(chatId: string) {
  const helpMessage = 
    "🤖 *CRM Bot Help*\n\n" +
    "*Available Commands:*\n\n" +
    "1. *Add Customer:* To add a new customer to the CRM\n" +
    "   Format:\n" +
    "   Add Customer: John Doe\n" +
    "   Number: 9876543210\n" +
    "   From: Mumbai\n" +
    "   Email: john@example.com (optional)\n" +
    "   Interested in: Printer (optional)\n\n" +
    "2. *Help:* Show this help message\n\n" +
    "You will also receive notifications for service calls, follow-ups, and inventory alerts based on your preferences.";

  await sendTelegramMessage(chatId, helpMessage);
  
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sendTelegramMessage(chatId: string, text: string) {
  try {
    const apiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      throw new Error(`Telegram API error: ${errorData.description}`);
    }

    // Log the outgoing message
    await supabase
      .from('telegram_message_logs')
      .insert({
        chat_id: chatId,
        message_text: text,
        message_type: 'text',
        direction: 'outgoing',
        processed_status: 'sent'
      });

    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}
