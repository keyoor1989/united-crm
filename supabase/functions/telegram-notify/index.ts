
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
    const { notification_type, data } = await req.json();

    if (!notification_type || !data) {
      return new Response(JSON.stringify({ 
        error: 'notification_type and data are required' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Get all authorized and active chats
    const { data: chats, error: chatError } = await supabase
      .from('telegram_authorized_chats')
      .select('chat_id')
      .eq('is_active', true);

    if (chatError) {
      throw new Error(`Error fetching chats: ${chatError.message}`);
    }

    if (!chats || chats.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No active chats to notify' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Get notification preferences for each chat
    const { data: preferences, error: prefError } = await supabase
      .from('telegram_notification_preferences')
      .select('*');

    if (prefError) {
      throw new Error(`Error fetching preferences: ${prefError.message}`);
    }

    const preferenceMap = new Map();
    preferences?.forEach(pref => {
      preferenceMap.set(pref.chat_id, pref);
    });

    // Generate notification message based on type
    const { message, prefKey } = generateNotificationMessage(notification_type, data);

    // Track successful sends
    const results = [];

    // Send notification to each eligible chat based on preferences
    for (const chat of chats) {
      // Check if chat has preference for this notification type
      const chatPrefs = preferenceMap.get(chat.chat_id) || {};
      
      // Check if notification should be sent to this chat
      if (chatPrefs[prefKey] === true) {
        const result = await sendTelegramMessage(chat.chat_id, message);
        results.push(result);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Notification sent to ${results.length} chats` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error in telegram-notify:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

// Generate notification message based on type
function generateNotificationMessage(type: string, data: any): { message: string, prefKey: string } {
  switch (type) {
    case 'service_call':
      return {
        message: `
🔧 <b>New Service Call</b>

Customer: ${data.customer_name}
Location: ${data.location}
Issue: ${data.issue_description}
Priority: ${data.priority}
        `,
        prefKey: 'service_calls'
      };

    case 'follow_up':
      return {
        message: `
📝 <b>Customer Follow-up</b>

Customer: ${data.customer_name}
Type: ${data.type}
Notes: ${data.notes || 'No notes provided'}
Due: ${new Date(data.date).toLocaleString()}
Status: ${data.status}
        `,
        prefKey: 'customer_followups'
      };

    case 'inventory_alert':
      return {
        message: `
⚠️ <b>Inventory Alert</b>

Item: ${data.part_name}
Current Stock: ${data.quantity}
Min Stock Level: ${data.min_stock}
Action Required: Reorder Soon
        `,
        prefKey: 'inventory_alerts'
      };
      
    case 'new_customer':
      return {
        message: `
🆕 <b>New Customer Added</b>

Name: ${data.name}
Location: ${data.location}
Phone: ${data.phone}
Source: ${data.source || 'Website'}
        `,
        prefKey: 'customer_followups'
      };
      
    case 'task_assignment':
      return {
        message: `
📋 <b>New Task Assigned</b>

Engineer: ${data.engineer_name || 'Not assigned'}
Customer: ${data.customer_name}
Task: ${data.description || data.notes}
Due: ${new Date(data.date || data.deadline).toLocaleString()}
        `,
        prefKey: 'service_calls'
      };
      
    case 'quotation_created':
      return {
        message: `
💰 <b>New Quotation Created</b>

Customer: ${data.customer_name}
Products: ${data.items?.length || 0} items
Total: ₹${data.grand_total?.toLocaleString() || '0'}
Status: ${data.status || 'Draft'}
        `,
        prefKey: 'customer_followups'
      };

    default:
      return {
        message: `
📣 <b>Notification</b>

Type: ${type}
Details: Custom notification
Time: ${new Date().toLocaleString()}
        `,
        prefKey: 'service_calls' // Default preference
      };
  }
}

// Send a message to a Telegram chat
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
    if (responseData.ok) {
      await supabase.from('telegram_message_logs').insert({
        chat_id,
        message_text: text,
        message_type: 'notification',
        direction: 'outgoing',
        processed_status: 'sent',
      });
    } else {
      console.error('Failed to send Telegram message:', responseData);
      await supabase.from('telegram_message_logs').insert({
        chat_id,
        message_text: text,
        message_type: 'notification',
        direction: 'outgoing',
        processed_status: 'failed',
      });
    }

    return responseData;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    
    // Log error
    await supabase.from('telegram_message_logs').insert({
      chat_id,
      message_text: text,
      message_type: 'notification',
      direction: 'outgoing',
      processed_status: 'error',
    });
    
    throw error;
  }
}
