
import React, { useEffect } from "react";
import AppSidebar from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";

// This component only renders the sidebar if the user is authenticated
const RestrictedSidebar = () => {
  const { user, isAuthenticated } = useAuth();
  const { setOpen } = useSidebar();
  
  useEffect(() => {
    // If authentication status changes, try to get saved sidebar state
    if (isAuthenticated) {
      try {
        // If user logs in, check if there's a saved preference
        const savedState = localStorage.getItem("sidebar-expanded-state");
        if (savedState !== null) {
          setOpen(savedState === "true");
        }
      } catch (error) {
        console.error("Error restoring sidebar state:", error);
      }
    }
  }, [isAuthenticated, setOpen]);
  
  if (!isAuthenticated || !user) return null;
  
  return <AppSidebar />;
};

export default RestrictedSidebar;
