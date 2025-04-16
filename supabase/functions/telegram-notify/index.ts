
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
    
    // Parse the request body
    const { notification_type, data } = await req.json();
    
    if (!notification_type || !data) {
      return new Response(
        JSON.stringify({ error: 'notification_type and data are required parameters' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Get authorized chats with appropriate notification preferences
    const { data: chats, error: chatsError } = await supabase
      .from('telegram_authorized_chats')
      .select('*, telegram_notification_preferences!inner(*)')
      .eq('is_active', true);
    
    if (chatsError) {
      console.error("Error fetching authorized chats:", chatsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch chat preferences' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    // Filter chats based on notification type
    const targetChats = chats.filter(chat => {
      const preferences = chat.telegram_notification_preferences[0];
      if (!preferences) return false;
      
      switch (notification_type) {
        case 'service_call':
          return preferences.service_calls;
        case 'follow_up':
          return preferences.customer_followups;
        case 'inventory_alert':
          return preferences.inventory_alerts;
        case 'new_customer':
          return preferences.service_calls; // Using service_calls as default for new customers
        default:
          return false;
      }
    });
    
    if (targetChats.length === 0) {
      console.log(`No authorized chats for notification type: ${notification_type}`);
      return new Response(
        JSON.stringify({ message: 'No chats configured for this notification type' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    // Generate message text based on notification type
    let messageText = '';
    let parseMode = 'HTML';
    
    switch (notification_type) {
      case 'service_call':
        messageText = formatServiceCallMessage(data);
        break;
      case 'follow_up':
        messageText = formatFollowUpMessage(data);
        break;
      case 'inventory_alert':
        messageText = formatInventoryAlertMessage(data);
        break;
      case 'new_customer':
        messageText = formatNewCustomerMessage(data);
        break;
      default:
        messageText = `⚠️ Unknown notification type: ${notification_type}`;
    }
    
    // Send message to all target chats
    const telegramApi = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    
    const sendPromises = targetChats.map(async (chat) => {
      try {
        console.log(`Sending ${notification_type} notification to chat ${chat.chat_id}`);
        
        const response = await fetch(telegramApi, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chat.chat_id,
            text: messageText,
            parse_mode: parseMode
          }),
        });
        
        const responseData = await response.json();
        
        // Log the message
        await supabase.from('telegram_message_logs').insert({
          chat_id: chat.chat_id,
          message_text: messageText.substring(0, 500),
          message_type: notification_type,
          direction: 'outgoing',
          processed_status: responseData.ok ? 'sent' : 'failed'
        });
        
        return { chat_id: chat.chat_id, success: responseData.ok };
      } catch (error) {
        console.error(`Error sending message to chat ${chat.chat_id}:`, error);
        return { chat_id: chat.chat_id, success: false, error: error.message };
      }
    });
    
    const results = await Promise.all(sendPromises);
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error in telegram-notify:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

// Message formatting functions
function formatServiceCallMessage(data: any): string {
  return `
🔧 <b>New Service Call Assigned</b>

<b>Customer:</b> ${data.customer_name || 'Unknown'}
<b>Location:</b> ${data.location || 'Not specified'}
<b>Issue:</b> ${data.issue_description || 'No description provided'}
<b>Priority:</b> ${data.priority || 'Normal'}
<b>Assigned To:</b> ${data.engineer_name || 'Unassigned'}
${data.sla_deadline ? `<b>Deadline:</b> ${new Date(data.sla_deadline).toLocaleString()}` : ''}
`;
}

function formatFollowUpMessage(data: any): string {
  return `
📞 <b>Customer Follow-up Reminder</b>

<b>Customer:</b> ${data.customer_name || 'Unknown'}
<b>Phone:</b> ${data.phone || 'Not available'}
<b>Last Contact:</b> ${data.last_contact ? new Date(data.last_contact).toLocaleDateString() : 'Unknown'}
<b>Notes:</b> ${data.notes || 'No notes available'}
<b>Follow-up Type:</b> ${data.follow_up_type || 'General'}
${data.follow_up_date ? `<b>Follow-up Date:</b> ${new Date(data.follow_up_date).toLocaleDateString()}` : ''}
`;
}

function formatInventoryAlertMessage(data: any): string {
  return `
📦 <b>Inventory Alert</b>

<b>Item:</b> ${data.part_name || 'Unknown Item'}
<b>Current Stock:</b> ${data.current_stock !== undefined ? data.current_stock : 'Unknown'} units
<b>Min Stock Level:</b> ${data.min_stock_level !== undefined ? data.min_stock_level : 'Not set'} units
<b>Status:</b> LOW STOCK - Please reorder
${data.supplier ? `<b>Supplier:</b> ${data.supplier}` : ''}
`;
}

function formatNewCustomerMessage(data: any): string {
  return `
👤 <b>New Customer Added</b>

<b>Name:</b> ${data.name || 'Unknown'}
<b>Phone:</b> ${data.phone || 'Not provided'}
<b>Location:</b> ${data.area || 'Not provided'}
${data.address ? `<b>Address:</b> ${data.address}` : ''}
${data.email ? `<b>Email:</b> ${data.email}` : ''}
<b>Source:</b> ${data.source || 'Not specified'}
`;
}
