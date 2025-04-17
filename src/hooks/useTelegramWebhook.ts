
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WebhookInfo } from '@/types/telegram';
import { toast } from 'sonner';

export const useTelegramWebhook = () => {
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getWebhookInfo = useCallback(async (): Promise<WebhookInfo | null> => {
    if (isLoading) {
      return webhookInfo;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { action: "getWebhookInfo" }
      });
      
      if (error) {
        console.error("Error fetching webhook info:", error);
        toast.error(`Failed to fetch webhook info: ${error.message}`);
        return null;
      }
      
      if (data) {
        setWebhookInfo(data as WebhookInfo);
        return data as WebhookInfo;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching webhook info:", error);
      toast.error(`Failed to fetch webhook info: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, webhookInfo]);

  const updateWebhook = useCallback(async (url: string, configId?: string, webhookSecret?: string | null): Promise<boolean> => {
    try {
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
