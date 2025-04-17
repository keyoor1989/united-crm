
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TelegramConfig } from '@/types/telegram';
import { toast } from 'sonner';

export const useTelegramConfig = () => {
  const [config, setConfig] = useState<TelegramConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadConfig = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('telegram_config')
        .select('*')
        .single();
      
      if (error) {
        console.error("Error loading Telegram config:", error);
        toast.error("Failed to load Telegram configuration");
        return;
      }
      
      setConfig(data as unknown as TelegramConfig);
    } catch (error) {
      console.error("Error loading Telegram config:", error);
      toast.error("Failed to load Telegram configuration");
    }
  };

  return {
    config,
    setConfig,
    isLoading,
    setIsLoading,
    loadConfig
  };
};
