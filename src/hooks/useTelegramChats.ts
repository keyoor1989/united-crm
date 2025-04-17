
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthorizedChat, NotificationPreference } from '@/types/telegram';
import { toast } from 'sonner';

export const useTelegramChats = () => {
  const [chats, setChats] = useState<AuthorizedChat[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadChats = async (): Promise<void> => {
    try {
      const [chatsResult, prefsResult] = await Promise.all([
        supabase.from('telegram_authorized_chats').select('*').order('created_at', { ascending: false }),
        supabase.from('telegram_notification_preferences').select('*'),
      ]);

      if (chatsResult.data) {
        setChats(chatsResult.data as unknown as AuthorizedChat[]);
      }
      
      if (prefsResult.data) {
        setPreferences(prefsResult.data as unknown as NotificationPreference[]);
      }
    } catch (error) {
      console.error("Error loading Telegram chat data:", error);
      toast.error("Failed to load Telegram chats");
    }
  };

  const addAuthorizedChat = async (chatId: string, chatName: string): Promise<boolean> => {
    try {
      const { data: existingChat } = await supabase
        .from('telegram_authorized_chats')
        .select('*')
        .eq('chat_id', chatId)
        .maybeSingle();
      
      if (existingChat) {
        toast.error("This chat ID is already authorized");
        return false;
      }
      
      const { error } = await supabase.from('telegram_authorized_chats').insert({
        chat_id: chatId,
        chat_name: chatName || `Chat ${chatId}`,
        is_active: true
      });

      if (error) throw error;
      
      const { error: prefError } = await supabase.from('telegram_notification_preferences').insert({
        chat_id: chatId,
        service_calls: true,
        customer_followups: true,
        inventory_alerts: false
      });
      
      if (prefError) console.error("Error creating notification preferences:", prefError);
      
      await loadChats();
      return true;
    } catch (error) {
      console.error("Error authorizing chat:", error);
      toast.error(`Failed to authorize chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const toggleChatStatus = async (chatId: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('telegram_authorized_chats')
        .update({ is_active: !isActive })
        .eq("chat_id", chatId);
      
      if (error) throw error;
      
      await loadChats();
      return true;
    } catch (error) {
      console.error("Error toggling chat status:", error);
      toast.error(`Failed to update chat status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const updateNotificationPreference = async (
    chatId: string, 
    field: 'service_calls' | 'customer_followups' | 'inventory_alerts',
    value: boolean
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('telegram_notification_preferences')
        .update({ [field]: value })
        .eq("chat_id", chatId);
      
      if (error) throw error;
      
      await loadChats();
      return true;
    } catch (error) {
      console.error("Error updating notification preference:", error);
      toast.error(`Failed to update notification preference: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const sendTestMessage = async (chatId: string, message: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("telegram-send-message", {
        body: { 
          chat_id: chatId,
          text: message
        }
      });
      
      if (error) {
        console.error("Error sending test message:", error);
        toast.error(`Failed to send message: ${error.message}`);
        return false;
      }
      
      if (data && data.ok) {
        return true;
      } else {
        const errorMessage = data && data.description ? data.description : "Unknown error";
        toast.error(`Failed to send message: ${errorMessage}`);
        return false;
      }
    } catch (error) {
      console.error("Error sending test message:", error);
      toast.error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  return {
    chats,
    preferences,
    isLoading,
    setIsLoading,
    loadChats,
    addAuthorizedChat,
    toggleChatStatus,
    updateNotificationPreference,
    sendTestMessage
  };
};
