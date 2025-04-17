
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WebhookInfo } from '@/types/telegram';
import { toast } from 'sonner';

export const useTelegramWebhook = () => {
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Add a lastFetchTime state to throttle requests
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  // Track fetch errors for exponential backoff
  const [fetchErrorCount, setFetchErrorCount] = useState<number>(0);
  
  const getWebhookInfo = useCallback(async (): Promise<WebhookInfo | null> => {
    // Skip if already loading
    if (isLoading) {
      console.log("Skipping webhook fetch - already loading");
      return null;
    }
    
    // Implement throttling logic
    const now = Date.now();
    const minTimeBetweenFetches = 3000; // 3 seconds minimum between fetches
    
    // Add exponential backoff on errors
    const backoffTime = fetchErrorCount > 0 
      ? Math.min(30000, Math.pow(2, fetchErrorCount) * 1000) 
      : 0;
    
    const timeToWait = Math.max(0, (lastFetchTime + minTimeBetweenFetches + backoffTime) - now);
    
    if (timeToWait > 0) {
      console.log(`Throttling webhook fetch - wait ${timeToWait}ms`);
      return webhookInfo; // Return existing data
    }
    
    try {
      console.log("Fetching webhook info...");
      setIsLoading(true);
      setLastFetchTime(now);
      
      const { data, error } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { action: "getWebhookInfo" }
      });
      
      if (error) {
        console.error("Error fetching webhook info:", error);
        setFetchErrorCount(prev => prev + 1);
        toast.error(`Failed to fetch webhook info: ${error.message}`);
        return null;
      }
      
      if (data) {
        console.log("Webhook info received:", data);
        setWebhookInfo(data as WebhookInfo);
        // Reset error count on success
        setFetchErrorCount(0);
        return data as WebhookInfo;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching webhook info:", error);
      setFetchErrorCount(prev => prev + 1);
      toast.error(`Failed to fetch webhook info: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, lastFetchTime, fetchErrorCount, webhookInfo]);

  const updateWebhook = useCallback(async (url: string, configId?: string, webhookSecret?: string | null): Promise<boolean> => {
    try {
      console.log("Setting webhook to:", url);
      
      // If no webhook secret is provided, generate one
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
    }
  }, [getWebhookInfo]);

  const deleteWebhook = useCallback(async (): Promise<boolean> => {
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
    }
  }, [getWebhookInfo]);

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
