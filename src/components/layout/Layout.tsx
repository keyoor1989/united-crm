
import React, { ReactNode, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import { 
  SidebarProvider, 
  SidebarInset,
  useSidebar
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import RestrictedSidebar from "./RestrictedSidebar";
import "@/components/chat/chat.css";
import { useAuth } from "@/contexts/AuthContext";

const SidebarStateInitializer = () => {
  const { setOpen } = useSidebar();
  
  useEffect(() => {
    // Try to get the sidebar state from localStorage
    try {
      const savedState = localStorage.getItem("sidebar-expanded-state");
      // If we have a saved state, use it
      if (savedState !== null) {
        setOpen(savedState === "true");
      }
    } catch (error) {
      console.error("Failed to initialize sidebar state:", error);
    }
  }, [setOpen]);
  
  return null;
};

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuth();
  const defaultSidebarOpen = window.innerWidth >= 1024;
  
  useEffect(() => {
    // Add a resize event listener to handle responsive behavior
    const handleResize = () => {
      try {
        // Only update if no preference is saved yet
        if (localStorage.getItem("sidebar-expanded-state") === null) {
          const shouldBeOpen = window.innerWidth >= 1024;
          localStorage.setItem("sidebar-expanded-state", String(shouldBeOpen));
        }
      } catch (error) {
        console.error("Error in resize handler:", error);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultSidebarOpen}>
        <SidebarStateInitializer />
        <div className="flex min-h-screen w-full bg-background">
          <RestrictedSidebar />
          <SidebarInset className="flex flex-col">
            <Header />
            <main className="flex-1 p-6 overflow-auto">
              {children || <Outlet />}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default Layout;
