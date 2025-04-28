
import { useCallback, useEffect } from 'react';
import { useSidebar } from "@/components/ui/sidebar";

export const useSidebarState = () => {
  const { state, setOpen } = useSidebar();
  
  const updateSidebarState = useCallback((isOpen: boolean) => {
    try {
      localStorage.setItem("sidebar-expanded-state", String(isOpen));
      
      const event = new CustomEvent("sidebar-state-changed", { 
        detail: { isOpen } 
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error saving sidebar state:", error);
    }
  }, []);
  
  useEffect(() => {
    const isOpen = state === "expanded";
    updateSidebarState(isOpen);
  }, [state, updateSidebarState]);

  return { isCollapsed: state === "collapsed" };
};
