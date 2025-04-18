import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import AppRoutes from "./AppRoutes";
import "./App.css";
import { App as CapacitorApp } from '@capacitor/app';
import { useEffect } from 'react';
import { usePushNotifications } from './hooks/usePushNotifications';
import { useToast } from './hooks/use-toast';

const queryClient = new QueryClient();

const App = () => {
  const { toast } = useToast();
  usePushNotifications(); // Initialize push notifications

  useEffect(() => {
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
            <AppRoutes />
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
