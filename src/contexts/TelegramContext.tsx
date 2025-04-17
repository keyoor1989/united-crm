
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TelegramConfig {
  id: string;
  webhook_url: string | null;
  webhook_secret: string | null;
  created_at: string;
}

export interface WebhookInfo {
  ok: boolean;
  result?: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    max_connections: number;
    ip_address: string;
    last_error_date?: number;
    last_error_message?: string;
    allowed_updates: string[];
  };
  description?: string;
}

interface TelegramContextType {
  config: TelegramConfig | null;
  webhookInfo: WebhookInfo | null;
  webhookStatus: "active" | "inactive" | "error" | "loading";
  webhookUrl: string;
  isUpdatingWebhook: boolean;
  showSecret: boolean;
  setWebhookUrl: (url: string) => void;
  setShowSecret: (show: boolean) => void;
  fetchConfig: () => Promise<void>;
  fetchWebhookInfo: () => Promise<void>;
  setWebhook: () => Promise<void>;
  deleteWebhook: () => Promise<void>;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<TelegramConfig | null>(null);
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [webhookStatus, setWebhookStatus] = useState<"active" | "inactive" | "error" | "loading">("loading");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isUpdatingWebhook, setIsUpdatingWebhook] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Fetch Telegram configuration from database
  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('telegram_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching Telegram config:", error);
        setConfig(null);
        return;
      }

      setConfig(data);
      if (data?.webhook_url) {
        setWebhookUrl(data.webhook_url);
      }
    } catch (error) {
      console.error("Error in fetchTelegramConfig:", error);
      toast.error("Failed to fetch Telegram configuration");
    }
  };

  // Get webhook information from Telegram API
  const fetchWebhookInfo = async () => {
    setWebhookStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke('telegram-bot-setup', {
        body: { action: 'getWebhookInfo' }
      });

      if (error) {
        console.error("Error fetching webhook info:", error);
        setWebhookStatus("error");
        return;
      }

      setWebhookInfo(data);
      
      if (data.ok && data.result?.url) {
        setWebhookStatus("active");
      } else {
        setWebhookStatus("inactive");
      }
    } catch (error) {
      console.error("Error in fetchWebhookInfo:", error);
      setWebhookStatus("error");
      toast.error("Failed to fetch webhook information");
    }
  };

  // Set webhook URL in Telegram API
  const setWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL");
      return;
    }

    setIsUpdatingWebhook(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-bot-setup', {
        body: { 
          action: 'setWebhook',
          webhook_url: webhookUrl
        }
      });

      if (error) {
        console.error("Error setting webhook:", error);
        toast.error("Failed to set webhook");
        return;
      }

      if (data.success) {
        toast.success("Webhook set successfully");
        await fetchConfig();
        await fetchWebhookInfo();
      } else {
        toast.error(`Failed to set webhook: ${data.error || data.telegram_response?.description || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error in setWebhook:", error);
      toast.error("Failed to set webhook");
    } finally {
      setIsUpdatingWebhook(false);
    }
  };

  // Delete webhook from Telegram API
  const deleteWebhook = async () => {
    if (!confirm("Are you sure you want to delete the webhook?")) {
      return;
    }

    setIsUpdatingWebhook(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-bot-setup', {
        body: { action: 'deleteWebhook' }
      });

      if (error) {
        console.error("Error deleting webhook:", error);
        toast.error("Failed to delete webhook");
        return;
      }

      if (data.ok) {
        toast.success("Webhook deleted successfully");
        setWebhookUrl("");
        await fetchConfig();
        await fetchWebhookInfo();
      } else {
        toast.error(`Failed to delete webhook: ${data.description || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error in deleteWebhook:", error);
      toast.error("Failed to delete webhook");
    } finally {
      setIsUpdatingWebhook(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (config?.webhook_url) {
      fetchWebhookInfo();
    } else {
      setWebhookStatus("inactive");
    }
  }, [config]);

  return (
    <TelegramContext.Provider
      value={{
        config,
        webhookInfo,
        webhookStatus,
        webhookUrl,
        isUpdatingWebhook,
        showSecret,
        setWebhookUrl,
        setShowSecret,
        fetchConfig,
        fetchWebhookInfo,
        setWebhook,
        deleteWebhook
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error("useTelegram must be used within a TelegramProvider");
  }
  return context;
};
