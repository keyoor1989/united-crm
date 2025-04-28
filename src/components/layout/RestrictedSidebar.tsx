
import React, { useEffect } from "react";
import AppSidebar from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";

// This component only renders the sidebar if the user is authenticated
const RestrictedSidebar = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { setOpen } = useSidebar();
  
  useEffect(() => {
    // If authentication status changes, restore sidebar state
    if (isAuthenticated && user) {
      try {
        // Use a more consistent approach for getting saved state
        const savedState = localStorage.getItem("sidebar-expanded-state");
        if (savedState !== null) {
          // Apply the saved state
          setOpen(savedState === "true");
          
          // Force a DOM update to ensure the sidebar renders correctly
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 100);
        } else {
          // If no saved state found, set default based on screen size
          const defaultState = window.innerWidth >= 1024;
          setOpen(defaultState);
          localStorage.setItem("sidebar-expanded-state", String(defaultState));
        }
      } catch (error) {
        console.error("Error restoring sidebar state:", error);
        // Fallback to default state if there's an error
        setOpen(window.innerWidth >= 1024);
      }
    } else if (!isLoading && !isAuthenticated) {
      // If not authenticated and not loading, hide sidebar
      setOpen(false);
    }
  }, [isAuthenticated, isLoading, user, setOpen]);
  
  // Don't render sidebar if not authenticated
  if (!isAuthenticated || !user) {
    console.log("RestrictedSidebar: User not authenticated, not rendering sidebar");
    return null;
  }
  
  return <AppSidebar />;
};

export default RestrictedSidebar;
