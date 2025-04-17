
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TelegramConfig, AuthorizedChat, NotificationPreference, WebhookInfo } from '@/types/telegram';
import { useTelegramConfig } from '@/hooks/useTelegramConfig';
import { useTelegramChats } from '@/hooks/useTelegramChats';
import { useTelegramWebhook } from '@/hooks/useTelegramWebhook';

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
  const [isLoading, setIsLoading] = useState(true);
  const telegramConfig = useTelegramConfig();
  const telegramChats = useTelegramChats();
  const telegramWebhook = useTelegramWebhook();

  useEffect(() => {
    refreshData();
    // We don't need to auto-refresh on component mount
    // Let the specific pages handle their own refresh logic
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      await telegramConfig.loadConfig();
      await telegramChats.loadChats();
      
      // Only fetch webhook info if we have a config
      if (telegramConfig.config) {
        await telegramWebhook.getWebhookInfo();
      }
    } catch (error) {
      console.error("Error loading Telegram data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    config: telegramConfig.config,
    chats: telegramChats.chats,
    preferences: telegramChats.preferences,
    webhookInfo: telegramWebhook.webhookInfo,
    isLoading,
    refreshData,
    updateWebhook: (url: string) => telegramWebhook.updateWebhook(url, telegramConfig.config?.id, telegramConfig.config?.webhook_secret),
    deleteWebhook: telegramWebhook.deleteWebhook,
    addAuthorizedChat: telegramChats.addAuthorizedChat,
    toggleChatStatus: telegramChats.toggleChatStatus,
    updateNotificationPreference: telegramChats.updateNotificationPreference,
    sendTestMessage: telegramChats.sendTestMessage,
    setCommands: telegramWebhook.setCommands,
    getWebhookInfo: telegramWebhook.getWebhookInfo
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
