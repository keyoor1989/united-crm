
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

// Get today's date at midnight for comparison
const getTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Format date for display in message
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric'
  });
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily follow-up reminders check...");
    const currentHour = new Date().getHours();
    
    // Only run at around 10 AM (between 9:45 AM and 10:15 AM) unless it's a manual trigger
    const isManualTrigger = req.method === 'POST';
    const isScheduledTime = currentHour === 10;
    
    if (!isManualTrigger && !isScheduledTime) {
      return new Response(JSON.stringify({ 
        message: `Not running. Current hour: ${currentHour}, expected hour: 10`,
        success: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Get today's date and tomorrow's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Format date for SQL query
    const formattedDate = today.toISOString().split('T')[0];

    // Get all follow-ups scheduled for today that haven't had reminders sent
    const { data: followUps, error: followUpsError } = await supabase
      .from('sales_followups')
      .select('*')
      .eq('reminder_sent', false)
      .gte('date', `${formattedDate}T00:00:00.000Z`)
      .lte('date', `${formattedDate}T23:59:59.999Z`)
      .eq('status', 'pending');

    if (followUpsError) {
      throw new Error(`Error fetching follow-ups: ${followUpsError.message}`);
    }

    console.log(`Found ${followUps?.length || 0} follow-ups for today that need reminders`);

    if (!followUps || followUps.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No pending follow-ups for today that need reminders',
        success: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Get all authorized and active chats
    const { data: chats, error: chatError } = await supabase
      .from('telegram_authorized_chats')
      .select('*')
      .eq('is_active', true);

    if (chatError) {
      throw new Error(`Error fetching chats: ${chatError.message}`);
    }

    if (!chats || chats.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No active telegram chats to notify' 
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

    // Track successful notifications
    const results = [];
    const updatedFollowUpIds = [];

    // Send notification for each follow-up
    for (const followUp of followUps) {
      // Create a detailed notification message for the follow-up
      const message = `
🔔 <b>FOLLOW-UP REMINDER FOR TODAY</b>

<b>Customer:</b> ${followUp.customer_name}
<b>Type:</b> ${followUp.type}
<b>Time:</b> ${new Date(followUp.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
${followUp.notes ? `<b>Notes:</b> ${followUp.notes}` : ''}
${followUp.location ? `<b>Location:</b> ${followUp.location}` : ''}
${followUp.contact_phone ? `<b>Contact:</b> ${followUp.contact_phone}` : ''}

<i>Please make sure to update the follow-up status after completion.</i>
      `;

      // Send to all chats with customer_followups preference
      for (const chat of chats) {
        // Check if chat has preference for follow-up notifications
        const chatPrefs = preferenceMap.get(chat.chat_id) || {};
        
        if (chatPrefs.customer_followups === true) {
          const sendResult = await sendTelegramMessage(chat.chat_id, message);
          
          if (sendResult.ok) {
            results.push({
              chat_id: chat.chat_id,
              follow_up_id: followUp.id,
              success: true
            });
            
            // Mark this follow-up as having had a reminder sent
            if (!updatedFollowUpIds.includes(followUp.id)) {
              updatedFollowUpIds.push(followUp.id);
            }
          } else {
            results.push({
              chat_id: chat.chat_id,
              follow_up_id: followUp.id,
              success: false,
              error: sendResult.description || 'Unknown error'
            });
          }
        }
      }
    }

    // Update the follow-ups to mark reminders as sent
    if (updatedFollowUpIds.length > 0) {
      const { error: updateError } = await supabase
        .from('sales_followups')
        .update({ reminder_sent: true })
        .in('id', updatedFollowUpIds);
      
      if (updateError) {
        console.error('Error updating follow-ups:', updateError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Sent ${results.filter(r => r.success).length} follow-up reminders`,
      details: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error in daily-followup-reminders:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

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
        message_type: 'follow_up_reminder',
        direction: 'outgoing',
        processed_status: 'sent',
      });
    } else {
      console.error('Failed to send Telegram message:', responseData);
      await supabase.from('telegram_message_logs').insert({
        chat_id,
        message_text: text,
        message_type: 'follow_up_reminder',
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
      message_type: 'follow_up_reminder',
      direction: 'outgoing',
      processed_status: 'error',
    });
    
    return { ok: false, description: error.message };
  }
}
