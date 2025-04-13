
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TelegramConfig, AuthorizedChat, NotificationPreference, WebhookInfo } from '@/types/telegram';

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
        // We'll fetch webhook info in a future implementation
      }

      if (chatsResult.data) {
        setChats(chatsResult.data as unknown as AuthorizedChat[]);
      }
      
      if (prefsResult.data) {
        setPreferences(prefsResult.data as unknown as NotificationPreference[]);
      }
    } catch (error) {
      console.error("Error loading Telegram data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateWebhook = async (url: string): Promise<boolean> => {
    try {
      // Call the edge function to set webhook (future implementation)
      // For now, just update the database
      if (config) {
        const { error } = await supabase.from('telegram_config').update({
          webhook_url: url,
          updated_at: new Date().toISOString(),
        }).eq('id', config.id);
        
        if (error) throw error;
        
        await refreshData();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating webhook:", error);
      return false;
    }
  };

  const deleteWebhook = async (): Promise<boolean> => {
    try {
      // Call the edge function to delete webhook (future implementation)
      // For now, just update the database
      if (config) {
        const { error } = await supabase.from('telegram_config').update({
          webhook_url: null,
          updated_at: new Date().toISOString(),
        }).eq('id', config.id);
        
        if (error) throw error;
        
        await refreshData();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting webhook:", error);
      return false;
    }
  };

  const addAuthorizedChat = async (chatId: string, chatName: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('telegram_authorized_chats').insert({
        chat_id: chatId,
        chat_name: chatName || `Chat ${chatId}`,
        is_active: true
      });

      if (error) throw error;
      
      // Also create default notification preferences
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
      return false;
    }
  };

  const sendTestMessage = async (chatId: string, message: string): Promise<boolean> => {
    try {
      // This will be implemented with edge functions
      // For now, just log to database
      const { error } = await supabase.from('telegram_message_logs').insert({
        chat_id: chatId,
        message_text: message,
        message_type: "test",
        direction: "outgoing",
        processed_status: "sent"
      });
      
      if (error) throw error;
      
      await refreshData();
      return true;
    } catch (error) {
      console.error("Error sending test message:", error);
      return false;
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
    sendTestMessage
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
