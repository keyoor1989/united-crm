import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  SupabaseContextProvider,
  useSupabase,
} from "@/integrations/supabase/SupabaseProvider";
import { Helmet } from "react-helmet";
import { Toaster } from "sonner";
import AppRoutes from "./AppRoutes";
import "./App.css";
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useToast } from './hooks/use-toast';
import { setupMobileEnhancements } from "@/utils/mobileUtils";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
});

function AppContent() {
  const { user, isLoading, supabase } = useSupabase();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize mobile enhancements if running in Capacitor
    setupMobileEnhancements();
    
    // Handle app state for mobile
    if ('capacitor' in window) {
      // Listen for app state changes in Capacitor
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        console.info('App state changed. Is active?:', isActive);
      });
      
      // Initialize StatusBar for native mobile environment
      const initStatusBar = async () => {
        try {
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
          await StatusBar.setStyle({ style: Style.Dark });
        } catch (error) {
          console.error("Failed to initialize status bar:", error);
        }
      };

      initStatusBar();
    }
    
    const handleAuthStateChange = async (event: any) => {
      if (event === "SIGNED_OUT") {
        try {
          await supabase.auth.signOut();
          window.location.href = "/login";
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to sign out. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      supabase.auth.offAuthStateChange(handleAuthStateChange);
    };
  }, [supabase, toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Helmet>
        <title>United CRM</title>
        <meta name="description" content="A CRM application" />
      </Helmet>
      <Toaster />
      <AppRoutes />
    </>
  );
}

function App() {
  return (
    <SupabaseContextProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </SupabaseContextProvider>
  );
}

export default App;
