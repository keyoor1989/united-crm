
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WebhookInfo } from '@/types/telegram';
import { toast } from 'sonner';

export const useTelegramWebhook = () => {
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestInProgressRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const minFetchIntervalMs = 5000; // Minimum 5 seconds between API calls

  const getWebhookInfo = useCallback(async (): Promise<WebhookInfo | null> => {
    // Don't make concurrent requests
    if (requestInProgressRef.current) {
      return webhookInfo;
    }

    // Rate limiting - don't fetch more often than every 5 seconds
    const now = Date.now();
    if (now - lastFetchTimeRef.current < minFetchIntervalMs) {
      return webhookInfo;
    }

    try {
      requestInProgressRef.current = true;
      setIsLoading(true);
      lastFetchTimeRef.current = now;
      
      const { data, error } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { action: "getWebhookInfo" }
      });
      
      if (error) {
        console.error("Error fetching webhook info:", error);
        return null;
      }
      
      if (data) {
        setWebhookInfo(data as WebhookInfo);
        return data as WebhookInfo;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching webhook info:", error);
      return null;
    } finally {
      setIsLoading(false);
      requestInProgressRef.current = false;
    }
  }, [webhookInfo]);

  const updateWebhook = useCallback(async (url: string, configId?: string, webhookSecret?: string | null): Promise<boolean> => {
    if (requestInProgressRef.current) {
      toast.error("Another operation is in progress. Please wait.");
      return false;
    }

    try {
      requestInProgressRef.current = true;
      console.log("Setting webhook to:", url);
      
      if (!webhookSecret) {
        try {
          const randomSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join('');
          
          await supabase
            .from('telegram_config')
            .update({ webhook_secret: randomSecret })
            .eq('id', configId);
          
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
        await getWebhookInfo();
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
    } finally {
      requestInProgressRef.current = false;
    }
  }, [getWebhookInfo]);

  const deleteWebhook = useCallback(async (): Promise<boolean> => {
    if (requestInProgressRef.current) {
      toast.error("Another operation is in progress. Please wait.");
      return false;
    }

    try {
      requestInProgressRef.current = true;
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
        await getWebhookInfo();
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
    } finally {
      requestInProgressRef.current = false;
    }
  }, [getWebhookInfo]);

  const setCommands = async (): Promise<any> => {
    if (requestInProgressRef.current) {
      toast.error("Another operation is in progress. Please wait.");
      return { ok: false, error: "Another operation is in progress" };
    }

    try {
      requestInProgressRef.current = true;
      console.log("Setting bot commands");
      
      const { data, error } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { action: "setCommands" }
      });
      
      if (error) {
        console.error("Error setting commands:", error);
        toast.error(`Failed to set commands: ${error.message}`);
        return { ok: false, error: error.message };
      }
      
      return data;
    } catch (error) {
      console.error("Error setting commands:", error);
      toast.error(`Failed to set commands: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      requestInProgressRef.current = false;
    }
  };

  return {
    webhookInfo,
    isLoading,
    setIsLoading,
    getWebhookInfo,
    updateWebhook,
    deleteWebhook,
    setCommands
  };
};
