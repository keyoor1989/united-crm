
import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { VendorProvider } from "@/contexts/VendorContext";
import { Toaster } from "@/components/ui/toaster";
import AppRoutes from "./AppRoutes";
import "./App.css";
import { App as CapacitorApp } from '@capacitor/app';
import { usePushNotifications } from './hooks/usePushNotifications';
import { useToast } from './hooks/use-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const { toast } = useToast();
  
  // Only use push notifications in native mobile environments
  const isNative = window.location.href.includes('capacitor://') || window.location.href.includes('localhost');
  
  useEffect(() => {
    if (isNative) {
      // Initialize push notifications in native environment
      const initPushNotifications = async () => {
        try {
          await import('./hooks/usePushNotifications').then(module => {
            const { usePushNotifications } = module;
            usePushNotifications();
          });
        } catch (error) {
          console.error("Failed to initialize push notifications:", error);
        }
      };
      
      initPushNotifications();
    }
    
    // Handle back button in mobile apps
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    });

    // Handle app state changes
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active?:', isActive);
    });
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <VendorProvider>
              <AppRoutes />
              <Toaster />
            </VendorProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
