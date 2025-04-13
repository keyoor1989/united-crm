
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  TelegramConfig, 
  AuthorizedChat, 
  NotificationPreference, 
  WebhookInfo, 
  MessageLog 
} from "@/types/telegram";

export const useTelegram = () => {
  const [config, setConfig] = useState<TelegramConfig | null>(null);
  const [chats, setChats] = useState<AuthorizedChat[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch config, chats, and preferences
      const [configResult, chatsResult, logsResult, prefsResult] = await Promise.all([
        supabase.from('telegram_config').select('*').single(),
        supabase.from('telegram_authorized_chats').select('*').order('created_at', { ascending: false }),
        supabase.from('telegram_message_logs').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('telegram_notification_preferences').select('*'),
      ]);

      if (configResult.data) {
        setConfig(configResult.data as TelegramConfig);
        
        // Fetch webhook info if we have a config
        try {
          const { data: webhookData, error: webhookError } = await supabase.functions.invoke("telegram-bot-setup", {
            body: { action: "getWebhookInfo" }
          });
          
          if (!webhookError && webhookData) {
            setWebhookInfo(webhookData as WebhookInfo);
          }
        } catch (error) {
          console.error("Error fetching webhook info:", error);
        }
      }

      if (chatsResult.data) {
        setChats(chatsResult.data as AuthorizedChat[]);
      }
      
      if (logsResult.data) {
        setMessageLogs(logsResult.data as MessageLog[]);
      }
      
      if (prefsResult.data) {
        setPreferences(prefsResult.data as NotificationPreference[]);
      }
    } catch (error) {
      console.error("Error loading Telegram data:", error);
      toast.error("Failed to load Telegram configuration");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setWebhook = useCallback(async (url: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { 
          action: "setWebhook",
          webhook_url: url
        }
      });
      
      if (error) {
        console.error("Error setting webhook:", error);
        toast.error(`Failed to set webhook: ${error.message}`);
        return false;
      }
      
      if (data && data.ok) {
        await loadData(); // Refresh data
        return true;
      } else {
        const errorMessage = data && data.description ? data.description : "Unknown error";
        toast.error(`Failed to set webhook: ${errorMessage}`);
        return false;
      }
    } catch (error) {
      console.error("Error setting webhook:", error);
      toast.error("Failed to set webhook");
      return false;
    }
  }, [loadData]);

  const removeWebhook = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { action: "deleteWebhook" }
      });
      
      if (error) {
        console.error("Error deleting webhook:", error);
        toast.error(`Failed to delete webhook: ${error.message}`);
        return false;
      }
      
      if (data && data.ok) {
        await loadData(); // Refresh data
        return true;
      } else {
        const errorMessage = data && data.description ? data.description : "Unknown error";
        toast.error(`Failed to delete webhook: ${errorMessage}`);
        return false;
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast.error("Failed to delete webhook");
      return false;
    }
  }, [loadData]);

  const addChat = useCallback(async (chatId: string, chatName: string): Promise<boolean> => {
    try {
      // Check if chat already exists
      const { data: existingChat } = await supabase
        .from('telegram_authorized_chats')
        .select('*')
        .eq('chat_id', chatId)
        .single();
      
      if (existingChat) {
        toast.error("This chat ID is already authorized");
        return false;
      }
      
      // Add new chat
      const { error } = await supabase
        .from('telegram_authorized_chats')
        .insert({
          chat_id: chatId,
          chat_name: chatName || `Chat ${chatId}`,
          is_active: true
        });
      
      if (error) throw error;
      
      // Create default notification preferences
      await supabase
        .from('telegram_notification_preferences')
        .insert({
          chat_id: chatId,
          service_calls: true,
          customer_followups: true,
          inventory_alerts: false
        });
      
      await loadData(); // Refresh data
      return true;
    } catch (error) {
      console.error("Error adding chat:", error);
      return false;
    }
  }, [loadData]);

  const toggleChat = useCallback(async (chatId: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('telegram_authorized_chats')
        .update({ is_active: !isActive })
        .eq('chat_id', chatId);
      
      if (error) throw error;
      
      await loadData(); // Refresh data
      return true;
    } catch (error) {
      console.error("Error toggling chat status:", error);
      return false;
    }
  }, [loadData]);

  const updatePreference = useCallback(async (
    chatId: string,
    field: 'service_calls' | 'customer_followups' | 'inventory_alerts',
    currentValue: boolean
  ): Promise<boolean> => {
    try {
      // Check if preference exists
      const { data } = await supabase
        .from('telegram_notification_preferences')
        .select('*')
        .eq('chat_id', chatId);
      
      if (data && data.length > 0) {
        // Update existing preference
        const { error } = await supabase
          .from('telegram_notification_preferences')
          .update({ [field]: !currentValue })
          .eq('chat_id', chatId);
        
        if (error) throw error;
      } else {
        // Create new preference with defaults
        const newPref = {
          chat_id: chatId,
          service_calls: field === 'service_calls' ? !currentValue : true,
          customer_followups: field === 'customer_followups' ? !currentValue : true,
          inventory_alerts: field === 'inventory_alerts' ? !currentValue : false
        };
        
        const { error } = await supabase
          .from('telegram_notification_preferences')
          .insert(newPref);
        
        if (error) throw error;
      }
      
      await loadData(); // Refresh data
      return true;
    } catch (error) {
      console.error("Error updating preference:", error);
      return false;
    }
  }, [loadData]);

  const sendMessage = useCallback(async (chatId: string, text: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("telegram-send-message", {
        body: { 
          chat_id: chatId,
          text
        }
      });
      
      if (error) {
        console.error("Error sending message:", error);
        toast.error(`Failed to send message: ${error.message}`);
        return false;
      }
      
      if (data && data.ok) {
        await loadData(); // Refresh logs
        return true;
      } else {
        const errorMessage = data && data.description ? data.description : "Unknown error";
        toast.error(`Failed to send message: ${errorMessage}`);
        return false;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }, [loadData]);

  return {
    config,
    chats,
    messageLogs,
    preferences,
    webhookInfo,
    isLoading,
    loadData,
    setWebhook,
    removeWebhook,
    addChat,
    toggleChat,
    updatePreference,
    sendMessage
  };
};
