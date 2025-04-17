
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WebhookInfo } from '@/types/telegram';
import { toast } from 'sonner';

export const useTelegramWebhook = () => {
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestInProgressRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const minFetchIntervalMs = 10000; // Minimum 10 seconds between API calls

  const getWebhookInfo = useCallback(async (): Promise<WebhookInfo | null> => {
    // Don't make concurrent requests
    if (requestInProgressRef.current) {
      console.log("Skipping webhook info request - already in progress");
      return webhookInfo;
    }

    // Rate limiting - don't fetch more often than every 10 seconds
    const now = Date.now();
    if (now - lastFetchTimeRef.current < minFetchIntervalMs) {
      console.log("Skipping webhook info request - rate limited");
      return webhookInfo;
    }

    try {
      // Cancel any in-progress requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();
      
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
      abortControllerRef.current = null;
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
        
        // Delay the webhook info fetch slightly to allow Telegram to update
        setTimeout(() => {
          getWebhookInfo();
        }, 1000);
        
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
        
        // Delay the webhook info fetch slightly to allow Telegram to update
        setTimeout(() => {
          getWebhookInfo();
        }, 1000);
        
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

  // Cleanup function to abort any in-progress requests
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    webhookInfo,
    isLoading,
    setIsLoading,
    getWebhookInfo,
    updateWebhook,
    deleteWebhook,
    setCommands,
    cleanup
  };
};
