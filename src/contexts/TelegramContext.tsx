
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  isRefreshing: boolean;
  refreshData: (force?: boolean) => Promise<void>;
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const refreshTimeoutId = React.useRef<number | null>(null);
  
  const telegramConfig = useTelegramConfig();
  const telegramChats = useTelegramChats();
  const telegramWebhook = useTelegramWebhook();

  // Cleanup function for timers when component unmounts
  useEffect(() => {
    return () => {
      if (refreshTimeoutId.current) {
        window.clearTimeout(refreshTimeoutId.current);
        refreshTimeoutId.current = null;
      }
      
      // Cleanup any in-progress webhook requests
      telegramWebhook.cleanup();
    };
  }, [telegramWebhook]);
  
  const refreshData = useCallback(async (force = false) => {
    // Prevent concurrent refreshes
    if (isRefreshing && !force) return;
    
    // Implement rate limiting - don't refresh more often than every 5 seconds unless forced
    const now = Date.now();
    if (now - lastRefreshTime < 5000 && !force) {
      console.log("Skipping refresh - too soon since last refresh");
      return;
    }
    
    try {
      setIsRefreshing(true);
      setLastRefreshTime(now);
      
      if (!initialLoadComplete) {
        setIsLoading(true);
      }
      
      // Load config first
      await telegramConfig.loadConfig();
      
      // Then chats
      if (telegramConfig.config) {
        await telegramChats.loadChats();
      }
      
      // Then webhook info (only if on the setup tab)
      if (telegramConfig.config && window.location.hash.includes('setup')) {
        await telegramWebhook.getWebhookInfo();
      }
      
      setInitialLoadComplete(true);
    } catch (error) {
      console.error("Error loading Telegram data:", error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [initialLoadComplete, isRefreshing, lastRefreshTime, telegramConfig, telegramChats, telegramWebhook]);

  useEffect(() => {
    if (!initialLoadComplete) {
      refreshData(true);
    }
  }, [initialLoadComplete, refreshData]);

  const value = {
    config: telegramConfig.config,
    chats: telegramChats.chats,
    preferences: telegramChats.preferences,
    webhookInfo: telegramWebhook.webhookInfo,
    isLoading,
    isRefreshing,
    refreshData,
    updateWebhook: (url: string) => telegramWebhook.updateWebhook(url, telegramConfig.config?.id),
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
