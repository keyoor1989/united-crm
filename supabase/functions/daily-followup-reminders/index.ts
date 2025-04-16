
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
    
    // Force manual trigger for testing purposes
    const isManualTrigger = req.method === 'POST';
    console.log(`Execution type: ${isManualTrigger ? 'Manual trigger' : 'Scheduled execution'}`);
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Format date for SQL query - just the date part (YYYY-MM-DD)
    const formattedDate = today.toISOString().split('T')[0];
    console.log(`Looking for follow-ups on date: ${formattedDate}`);

    // IMPROVED DATE COMPARISON: 
    // Instead of using timestamp range, compare just the date part using ::date casting
    const { data: followUps, error: followUpsError } = await supabase
      .from('sales_followups')
      .select('*')
      .eq('status', 'pending')
      .filter('date::date', 'eq', formattedDate);

    if (followUpsError) {
      console.error(`Error fetching follow-ups: ${followUpsError.message}`);
      throw new Error(`Error fetching follow-ups: ${followUpsError.message}`);
    }

    console.log(`Found ${followUps?.length || 0} pending follow-ups for today`);
    console.log("Follow-ups data:", JSON.stringify(followUps));

    if (!followUps || followUps.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No pending follow-ups for today that need reminders',
        success: true,
        details: { 
          date: formattedDate,
          query_info: 'Searched for followups with date matching today (date part only)'
        }
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
      console.error(`Error fetching chats: ${chatError.message}`);
      throw new Error(`Error fetching chats: ${chatError.message}`);
    }

    if (!chats || chats.length === 0) {
      console.log("No active telegram chats found to notify");
      return new Response(JSON.stringify({ 
        message: 'No active telegram chats to notify',
        success: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    console.log(`Found ${chats.length} active Telegram chats`);

    // Get notification preferences for each chat
    const { data: preferences, error: prefError } = await supabase
      .from('telegram_notification_preferences')
      .select('*');

    if (prefError) {
      console.error(`Error fetching preferences: ${prefError.message}`);
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

      let sentToAnyChat = false;

      // Send to all chats with customer_followups preference
      for (const chat of chats) {
        // Check if chat has preference for follow-up notifications
        const chatPrefs = preferenceMap.get(chat.chat_id) || {};
        
        console.log(`Chat ${chat.chat_id} preferences:`, chatPrefs);
        
        if (chatPrefs.customer_followups === true) {
          console.log(`Sending reminder for follow-up ${followUp.id} to chat ${chat.chat_id}`);
          
          try {
            const sendResult = await sendTelegramMessage(chat.chat_id, message);
            
            console.log(`Send result for chat ${chat.chat_id}:`, sendResult);
            
            if (sendResult.ok) {
              results.push({
                chat_id: chat.chat_id,
                follow_up_id: followUp.id,
                success: true
              });
              
              sentToAnyChat = true;
              
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
              console.error(`Failed to send message to chat ${chat.chat_id}:`, sendResult);
            }
          } catch (error) {
            console.error(`Error sending message to chat ${chat.chat_id}:`, error);
            results.push({
              chat_id: chat.chat_id,
              follow_up_id: followUp.id,
              success: false,
              error: error.message || 'Unknown error'
            });
          }
        } else {
          console.log(`Chat ${chat.chat_id} does not have follow-up notifications enabled`);
        }
      }

      // Only mark as sent if successfully sent to at least one chat
      if (sentToAnyChat && !updatedFollowUpIds.includes(followUp.id)) {
        updatedFollowUpIds.push(followUp.id);
      }
    }

    // Update the follow-ups to mark reminders as sent
    if (updatedFollowUpIds.length > 0) {
      console.log(`Updating follow-ups with ids ${updatedFollowUpIds.join(', ')} to mark reminders as sent`);
      
      const { error: updateError } = await supabase
        .from('sales_followups')
        .update({ reminder_sent: true })
        .in('id', updatedFollowUpIds);
      
      if (updateError) {
        console.error('Error updating follow-ups:', updateError);
      } else {
        console.log(`Successfully updated ${updatedFollowUpIds.length} follow-ups`);
      }
    } else {
      console.log("No follow-ups were successfully sent, so none will be marked as sent");
    }

    // Prepare a detailed response including diagnostic information
    return new Response(JSON.stringify({ 
      success: updatedFollowUpIds.length > 0, 
      message: updatedFollowUpIds.length > 0 ? 
        `Sent ${updatedFollowUpIds.length} follow-up reminders` : 
        'No reminders were sent. Check Telegram bot configuration and notification preferences.',
      details: {
        date_checked: formattedDate,
        follow_ups_found: followUps.length,
        reminders_sent: updatedFollowUpIds.length,
        chat_count: chats.length,
        results
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error in daily-followup-reminders:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

// Send a message to a Telegram chat
async function sendTelegramMessage(chat_id: string, text: string) {
  try {
    console.log(`Sending Telegram message to chat ${chat_id}`);
    console.log(`Message text: ${text.substring(0, 50)}...`);
    
    if (!telegramBotToken) {
      console.error("Telegram bot token is not set");
      return { ok: false, description: "Telegram bot token is not set" };
    }
    
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
    console.log(`Telegram API response:`, responseData);
    
    // Log the outgoing message
    if (responseData.ok) {
      await supabase.from('telegram_message_logs').insert({
        chat_id,
        message_text: text,
        message_type: 'follow_up_reminder',
        direction: 'outgoing',
        processed_status: 'sent',
      });
      console.log('Message logged as sent');
    } else {
      console.error('Failed to send Telegram message:', responseData);
      await supabase.from('telegram_message_logs').insert({
        chat_id,
        message_text: text,
        message_type: 'follow_up_reminder',
        direction: 'outgoing',
        processed_status: 'failed',
      });
      console.log('Message logged as failed');
    }

    return responseData;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    
    // Log error
    try {
      await supabase.from('telegram_message_logs').insert({
        chat_id,
        message_text: text,
        message_type: 'follow_up_reminder',
        direction: 'outgoing',
        processed_status: 'error',
      });
      console.log('Error logged');
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return { ok: false, description: error.message };
  }
}
