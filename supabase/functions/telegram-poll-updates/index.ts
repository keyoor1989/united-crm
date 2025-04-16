
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
        JSON.stringify({ error: 'Telegram bot token is not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    const telegramApi = `https://api.telegram.org/bot${telegramBotToken}`;
    
    console.log("Starting polling for updates...");
    
    // Get the last update ID we processed
    const { data: lastUpdateData } = await supabase
      .from('telegram_config')
      .select('last_update_id')
      .single();
    
    const lastUpdateId = lastUpdateData?.last_update_id || 0;
    console.log("Last update ID:", lastUpdateId);
    
    // Get updates from Telegram
    const response = await fetch(`${telegramApi}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`);
    const updates = await response.json();
    
    if (!updates.ok) {
      console.error("Error getting updates:", updates);
      return new Response(
        JSON.stringify({ error: 'Failed to get updates', telegram_error: updates }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    console.log(`Received ${updates.result.length} updates`);
    
    let newLastUpdateId = lastUpdateId;
    
    // Process each update
    for (const update of updates.result) {
      newLastUpdateId = Math.max(newLastUpdateId, update.update_id);
      
      // Only process message updates
      if (!update.message) continue;
      
      const message = update.message;
      const chatId = message.chat.id.toString();
      const text = message.text || '';
      
      console.log(`Processing message from chat ${chatId}: ${text}`);
      
      // Log the incoming message
      await supabase.from('telegram_message_logs').insert({
        chat_id: chatId,
        message_text: text,
        message_type: text.startsWith('/') ? 'command' : 'message',
        direction: 'incoming',
        processed_status: 'received'
      });
      
      // Check if the chat is authorized
      const { data: chatData, error: chatError } = await supabase
        .from('telegram_authorized_chats')
        .select('*')
        .eq('chat_id', chatId)
        .eq('is_active', true)
        .single();
      
      if (chatError || !chatData) {
        console.log("Unauthorized chat attempt:", chatId);
        
        // Send message to unauthorized chat
        await fetch(`${telegramApi}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: "Your chat is not authorized. Please contact the system administrator.",
          }),
        });
        
        continue;
      }
      
      // Process commands
      if (text.startsWith('/')) {
        const command = text.split(' ')[0].substring(1).toLowerCase();
        
        switch (command) {
          case 'start':
            await fetch(`${telegramApi}/sendMessage`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chat_id: chatId,
                text: "Welcome to the Printer CRM Assistant! 👋\n\nI can help you with:\n• Adding new customers\n• Looking up customer information\n• Creating quotations\n• Assigning tasks to engineers\n• Getting daily reports\n\nType /help to see more details on how to use these features.",
                parse_mode: "HTML"
              }),
            });
            break;
            
          case 'help':
            await fetch(`${telegramApi}/sendMessage`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chat_id: chatId,
                text: "<b>Printer CRM Assistant Help</b>\n\nHere's how to use each feature:\n\n<b>1. Add Customer</b>\nFormat: Add Customer Name [name] Phone [mobile] Address [address] City [city] Interested In [product]\nExample: Add Customer Name Ravi Sharma Phone 8103349299 Address 123 MG Road City Indore Interested In Ricoh 2014D\n\n<b>2. Lookup Customer</b>\nFormat: Lookup [mobile number]\nExample: Lookup 8103349299\n\n<b>3. Create Quotation</b>\nFormat: Create Quotation Mobile: [number] Model: [model] Price: [price] GST: [rate]\nExample: Create Quotation Mobile: 8103349299 Model: Kyocera 2554ci Price: ₹115000 GST: 18%\n\n<b>4. Assign Task</b>\nFormat: Assign Task Engineer: [name] Customer: [name] Issue: [description] Deadline: [date]\nExample: Assign Task Engineer: Mohan Customer: Ravi Sharma Issue: Drum replacement Deadline: Tomorrow\n\n<b>5. Daily Report</b>\nSimply type: Daily Report",
                parse_mode: "HTML"
              }),
            });
            break;
            
          case 'lookup':
            const phoneNumber = text.split(' ')[1]?.trim();
            if (phoneNumber) {
              await supabase.functions.invoke("telegram-process-command", {
                body: {
                  chat_id: chatId,
                  text,
                  command_type: "lookup_customer",
                  phone: phoneNumber
                }
              });
            } else {
              await fetch(`${telegramApi}/sendMessage`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: "Please provide a phone number to lookup. Example: /lookup 8103349299",
                }),
              });
            }
            break;
            
          case 'report':
            await fetch(`${telegramApi}/sendMessage`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chat_id: chatId,
                text: "Generating today's activity report... This feature is coming soon.",
              }),
            });
            break;
            
          default:
            await fetch(`${telegramApi}/sendMessage`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chat_id: chatId,
                text: "Unknown command. Type /help for available commands.",
              }),
            });
            break;
        }
      } 
      else if (text.toLowerCase().startsWith('add customer') || 
              text.toLowerCase().startsWith('new customer')) {
        // Send to specialized function for processing
        await supabase.functions.invoke("telegram-process-command", {
          body: {
            chat_id: chatId,
            text,
            command_type: "add_customer"
          }
        });
      }
      else if (text.toLowerCase().startsWith('lookup') || 
              text.match(/^\d{10}$/) || 
              text.toLowerCase().includes('find customer')) {
        await supabase.functions.invoke("telegram-process-command", {
          body: {
            chat_id: chatId,
            text,
            command_type: "lookup_customer"
          }
        });
      }
      else {
        // Default response for unrecognized messages
        await fetch(`${telegramApi}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: "I didn't understand that command. Here's what I can help you with:\n\n• Add Customer [details]\n• Lookup [mobile number]\n• Daily Report\n\nType /help for more information.",
          }),
        });
      }
    }
    
    // Update the last update ID in the database
    if (newLastUpdateId > lastUpdateId) {
      await supabase
        .from('telegram_config')
        .update({ last_update_id: newLastUpdateId })
        .eq('id', 1);
    }
    
    return new Response(
      JSON.stringify({ success: true, updates_processed: updates.result.length }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error in telegram-poll-updates:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
