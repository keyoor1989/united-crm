
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

  try {
    const { notification_type, data } = await req.json();

    if (!telegramBotToken) {
      return new Response(JSON.stringify({ error: 'Telegram bot token not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get authorized chats with their notification preferences
    const { data: authorizedChats, error: chatError } = await supabase
      .from('telegram_authorized_chats')
      .select(`
        chat_id,
        telegram_notification_preferences (
          service_calls,
          customer_followups,
          inventory_alerts
        )
      `)
      .eq('is_active', true);

    if (chatError || !authorizedChats || authorizedChats.length === 0) {
      return new Response(JSON.stringify({ error: 'No authorized chats found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare the notification message based on the type
    let message = '';
    
    switch (notification_type) {
      case 'service_call':
        message = formatServiceCallNotification(data);
        break;
      case 'follow_up':
        message = formatFollowUpNotification(data);
        break;
      case 'inventory_alert':
        message = formatInventoryAlertNotification(data);
        break;
      case 'new_customer':
        message = formatNewCustomerNotification(data);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid notification type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Send notifications to all authorized chats based on their preferences
    const sendPromises = authorizedChats.map(async (chat) => {
      const preferences = chat.telegram_notification_preferences[0] || {
        service_calls: true,
        customer_followups: true,
        inventory_alerts: false
      };

      // Check if the chat should receive this type of notification
      let shouldSend = false;
      if (notification_type === 'service_call' && preferences.service_calls) shouldSend = true;
      if (notification_type === 'follow_up' && preferences.customer_followups) shouldSend = true;
      if (notification_type === 'inventory_alert' && preferences.inventory_alerts) shouldSend = true;
      if (notification_type === 'new_customer') shouldSend = true; // Always send new customer notifications

      if (shouldSend) {
        await sendTelegramMessage(chat.chat_id, message);
        return { chat_id: chat.chat_id, sent: true };
      }

      return { chat_id: chat.chat_id, sent: false };
    });

    const results = await Promise.all(sendPromises);

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in telegram-notify function:', error);
    
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function formatServiceCallNotification(data) {
  return `🔧 *New Service Call*\n\n` +
    `Customer: ${data.customer_name}\n` +
    `Issue: ${data.issue_description || 'Not specified'}\n` +
    `Priority: ${data.priority || 'Normal'}\n` +
    `Machine: ${data.machine_model || 'Not specified'}\n` +
    `Location: ${data.location || 'Not specified'}\n` +
    `Phone: ${data.phone || 'Not specified'}`;
}

function formatFollowUpNotification(data) {
  return `📅 *Reminder: Customer Follow-up*\n\n` +
    `Customer: ${data.customer_name}\n` +
    `Type: ${data.type || 'General'}\n` +
    `Date: ${new Date(data.date).toLocaleDateString()}\n` +
    `Notes: ${data.notes || 'None'}\n` +
    `Location: ${data.location || 'Not specified'}\n` +
    `Phone: ${data.contact_phone || 'Not specified'}`;
}

function formatInventoryAlertNotification(data) {
  return `⚠️ *Inventory Alert: Low Stock*\n\n` +
    `Item: ${data.part_name}\n` +
    `Current Quantity: ${data.quantity}\n` +
    `Minimum Stock: ${data.min_stock}\n` +
    `Category: ${data.category}\n` +
    `Brand: ${data.brand || 'Not specified'}\n` +
    `Warehouse: ${data.warehouse_name || 'Main'}`;
}

function formatNewCustomerNotification(data) {
  return `👤 *New Customer Added*\n\n` +
    `Name: ${data.name}\n` +
    `Phone: ${data.phone}\n` +
    `Location: ${data.area || data.location || 'Not specified'}\n` +
    (data.email ? `Email: ${data.email}\n` : '') +
    `Source: ${data.source || 'Telegram'}\n` +
    (data.machines && data.machines.length > 0 ? `Interested in: ${data.machines.join(', ')}` : '');
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
