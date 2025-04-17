
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TelegramConfig } from '@/types/telegram';
import { toast } from 'sonner';

export const useTelegramConfig = () => {
  const [config, setConfig] = useState<TelegramConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastLoadTime = useRef(0);
  const requestInProgress = useRef(false);
  const MIN_LOAD_INTERVAL = 5000; // 5 seconds minimum between loads

  const loadConfig = useCallback(async (): Promise<void> => {
    // Don't make concurrent requests
    if (requestInProgress.current) {
      console.log("Skipping config load - already in progress");
      return;
    }
    
    // Rate limiting
    const now = Date.now();
    if (now - lastLoadTime.current < MIN_LOAD_INTERVAL && config) {
      console.log("Skipping config load - rate limited");
      return;
    }
    
    try {
      requestInProgress.current = true;
      setIsLoading(true);
      lastLoadTime.current = now;
      
      const { data, error } = await supabase
        .from('telegram_config')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error("Error loading Telegram config:", error);
        
        // Only show toast error on first load, not on refreshes
        if (!config) {
          toast.error("Failed to load Telegram configuration");
        }
        return;
      }
      
      setConfig(data as unknown as TelegramConfig);
    } catch (error) {
      console.error("Error loading Telegram config:", error);
      
      // Only show toast error on first load, not on refreshes
      if (!config) {
        toast.error("Failed to load Telegram configuration");
      }
    } finally {
      setIsLoading(false);
      requestInProgress.current = false;
    }
  }, [config]);

  return {
    config,
    setConfig,
    isLoading,
    setIsLoading,
    loadConfig
  };
};
