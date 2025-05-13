
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface StorageOptions {
  key: string;
  expiration?: number; // Time in milliseconds
}

interface OfflineData<T> {
  data: T;
  timestamp: number;
}

export function useOfflineStorage<T>(
  options: StorageOptions,
  onSync?: (data: T) => Promise<void>
) {
  const [data, setData] = useState<T | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedData = localStorage.getItem(options.key);
        if (savedData) {
          const parsed: OfflineData<T> = JSON.parse(savedData);
          
          // Check if data is expired
          if (options.expiration && Date.now() - parsed.timestamp > options.expiration) {
            localStorage.removeItem(options.key);
            return;
          }
          
          setData(parsed.data);
          setLastSynced(parsed.timestamp);
        }
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      }
    };

    loadSavedData();
  }, [options.key, options.expiration]);

  // Set up online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast({
        title: "You're back online",
        description: "Data will now sync with the server",
      });
      
      // Try to sync any pending data
      syncData();
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast({
        title: "You're offline",
        description: "Changes will be saved locally until you reconnect",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [data]);

  // Save data to localStorage
  const saveData = (newData: T) => {
    try {
      const dataToSave: OfflineData<T> = {
        data: newData,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(options.key, JSON.stringify(dataToSave));
      setData(newData);
      setLastSynced(dataToSave.timestamp);
      
      return true;
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
      return false;
    }
  };

  // Sync data with server
  const syncData = async () => {
    if (!data || !onSync || isOffline || isSyncing) return;

    try {
      setIsSyncing(true);
      await onSync(data);
      setIsSyncing(false);
      setLastSynced(Date.now());

      return true;
    } catch (error) {
      console.error('Failed to sync data with server:', error);
      setIsSyncing(false);
      return false;
    }
  };

  return {
    data,
    saveData,
    syncData,
    isOffline,
    isSyncing,
    lastSynced,
  };
}
