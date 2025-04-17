import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TelegramConfig, AuthorizedChat, NotificationPreference, WebhookInfo } from '@/types/telegram';
import { toast } from 'sonner';

interface TelegramContextType {
  config: TelegramConfig | null;
  chats: AuthorizedChat[];
  preferences: NotificationPreference[];
  webhookInfo: WebhookInfo | null;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateWebhook: (url: string) => Promise<boolean>;
  deleteWebhook: () => Promise<boolean>;
  addAuthorizedChat: (chatId: string, chatName: string) => Promise<boolean>;
  toggleChatStatus: (chatId: string, isActive: boolean) => Promise<boolean>;
  updateNotificationPreference: (
    chatId: string,
    field: 'service_calls' | 'customer_followups' | 'inventory_alerts',
    value: boolean
  ) => Promise<boolean>;
  sendTestMessage: (chatId: string, message: string) => Promise<boolean>;
  setCommands: () => Promise<any>;
  getWebhookInfo: () => Promise<WebhookInfo | null>;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<TelegramConfig | null>(null);
  const [chats, setChats] = useState<AuthorizedChat[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [configResult, chatsResult, prefsResult] = await Promise.all([
        supabase.from('telegram_config').select('*').single(),
        supabase.from('telegram_authorized_chats').select('*').order('created_at', { ascending: false }),
        supabase.from('telegram_notification_preferences').select('*'),
      ]);

      if (configResult.data) {
        setConfig(configResult.data as unknown as TelegramConfig);
        await getWebhookInfo();
      }

      if (chatsResult.data) {
        setChats(chatsResult.data as unknown as AuthorizedChat[]);
      }
      
      if (prefsResult.data) {
        setPreferences(prefsResult.data as unknown as NotificationPreference[]);
      }
    } catch (error) {
      console.error("Error loading Telegram data:", error);
      toast.error("Failed to load Telegram configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const getWebhookInfo = async (): Promise<WebhookInfo | null> => {
    try {
      console.log("Fetching webhook info...");
      
      const { data, error } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { action: "getWebhookInfo" }
      });
      
      if (error) {
        console.error("Error fetching webhook info:", error);
        toast.error(`Failed to fetch webhook info: ${error.message}`);
        return null;
      }
      
      if (data) {
        console.log("Webhook info received:", data);
        setWebhookInfo(data as WebhookInfo);
        return data as WebhookInfo;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching webhook info:", error);
      toast.error(`Failed to fetch webhook info: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const updateWebhook = async (url: string): Promise<boolean> => {
    try {
      console.log("Setting webhook to:", url);
      
      if (!config?.webhook_secret) {
        try {
          const randomSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join('');
          
          await supabase
            .from('telegram_config')
            .update({ webhook_secret: randomSecret })
            .eq('id', config?.id);
          
          console.log("Generated new webhook secret");
        } catch (secretError) {
          console.error("Error generating webhook secret:", secretError);
        }
      }
      
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
        if (data.warning) {
          toast.warning(data.warning);
        }
        
        await refreshData();
        return true;
      } else {
        const errorMessage = data && data.description ? data.description : "Unknown error";
        toast.error(`Failed to set webhook: ${errorMessage}`);
        return false;
      }
    } catch (error) {
      console.error("Error setting webhook:", error);
      toast.error(`Failed to set webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const deleteWebhook = async (): Promise<boolean> => {
    try {
      console.log("Deleting webhook");
      
      const { data, error } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { action: "deleteWebhook" }
      });
      
      if (error) {
        console.error("Error deleting webhook:", error);
        toast.error(`Failed to delete webhook: ${error.message}`);
        return false;
      }
      
      if (data && data.ok) {
        if (data.warning) {
          toast.warning(data.warning);
        }
        
        await refreshData();
        return true;
      } else {
        const errorMessage = data && data.description ? data.description : "Unknown error";
        toast.error(`Failed to delete webhook: ${errorMessage}`);
        return false;
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast.error(`Failed to delete webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
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
      
      await refreshData();
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
      
      await refreshData();
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
      
      await refreshData();
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
        await refreshData();
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

  const setCommands = async (): Promise<any> => {
    try {
      console.log("Setting bot commands");
      
      const { data, error } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { action: "setCommands" }
      });
      
      if (error) {
        console.error("Error setting commands:", error);
        toast.error(`Failed to set commands: ${error.message}`);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error setting commands:", error);
      toast.error(`Failed to set commands: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const value = {
    config,
    chats,
    preferences,
    webhookInfo,
    isLoading,
    refreshData,
    updateWebhook,
    deleteWebhook,
    addAuthorizedChat,
    toggleChatStatus,
    updateNotificationPreference,
    sendTestMessage,
    setCommands,
    getWebhookInfo
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = (): TelegramContextType => {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};
