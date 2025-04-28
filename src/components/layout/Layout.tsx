
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
    // Enhanced sidebar state initialization
    const initializeSidebarState = () => {
      try {
        // Try to get the sidebar state from localStorage
        const savedState = localStorage.getItem("sidebar-expanded-state");
        
        if (savedState !== null) {
          // Apply the saved state
          setOpen(savedState === "true");
        } else {
          // If no saved state, set based on screen width
          const defaultState = window.innerWidth >= 1024;
          setOpen(defaultState);
          // Save this initial default state
          localStorage.setItem("sidebar-expanded-state", String(defaultState));
        }
        
        // Force a layout update to ensure the sidebar is rendered correctly
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 200);
      } catch (error) {
        console.error("Failed to initialize sidebar state:", error);
        // Fallback to responsive default if there's an error
        setOpen(window.innerWidth >= 1024);
      }
    };
    
    // Initialize sidebar state on component mount
    initializeSidebarState();
    
    // Handle storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sidebar-expanded-state" && e.newValue !== null) {
        setOpen(e.newValue === "true");
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setOpen]);
  
  return null;
};

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuth();
  
  // Get default sidebar state, with a preference for stored state
  const getInitialSidebarState = (): boolean => {
    try {
      const savedState = localStorage.getItem("sidebar-expanded-state");
      return savedState !== null ? savedState === "true" : window.innerWidth >= 1024;
    } catch (error) {
      return window.innerWidth >= 1024;
    }
  };
  
  const defaultSidebarOpen = getInitialSidebarState();
  
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
    
    // Force a state check on load to ensure consistency
    const checkStateConsistency = () => {
      try {
        // Check if DOM state matches stored state
        const savedState = localStorage.getItem("sidebar-expanded-state");
        if (savedState !== null) {
          // Find any sidebar elements and check if they match the expected state
          const sidebarElements = document.querySelectorAll('[data-sidebar="sidebar"]');
          
          if (sidebarElements.length > 0) {
            const shouldBeOpen = savedState === "true";
            const sidebarState = document.querySelector('[data-state]')?.getAttribute('data-state');
            const isCurrentlyOpen = sidebarState === "expanded";
            
            // If there's a mismatch, trigger a resize event to reconcile
            if (shouldBeOpen !== isCurrentlyOpen) {
              window.dispatchEvent(new Event('resize'));
            }
          }
        }
      } catch (error) {
        console.error("Error checking state consistency:", error);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial check after component mounts and DOM is ready
    setTimeout(checkStateConsistency, 500);
    
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
