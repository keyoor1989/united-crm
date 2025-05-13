
import { useIsMobile } from "@/hooks/use-mobile";

// List of pages that have been verified as mobile-compatible
const VERIFIED_MOBILE_PAGES = [
  "login",
  "dashboard",
  // Add more pages as they are verified
];

/**
 * Hook to check if the current page is verified as mobile-compatible
 * @param pageName - The name of the current page
 * @returns Object containing mobile compatibility status and helper functions
 */
export function useMobileCompatibility(pageName: string) {
  const isMobile = useIsMobile();
  
  // Check if the current page is in the list of verified mobile pages
  const isVerifiedForMobile = VERIFIED_MOBILE_PAGES.includes(pageName);
  
  // If we're on mobile and the page isn't verified, we might want to show a warning
  const shouldShowCompatibilityWarning = isMobile && !isVerifiedForMobile;
  
  return {
    isMobile,
    isVerifiedForMobile,
    shouldShowCompatibilityWarning,
    
    // Helper function to get appropriate styles for a container based on mobile status
    getContainerStyles: () => {
      if (isMobile) {
        return "px-4 py-3"; // Smaller padding on mobile
      }
      return "px-6 py-6"; // Larger padding on desktop
    },
    
    // Helper function to get appropriate font size class
    getFontSizeClass: (desktopSize: string) => {
      if (isMobile) {
        // Return a smaller font size class for mobile
        switch (desktopSize) {
          case "text-2xl": return "text-xl";
          case "text-xl": return "text-lg";
          case "text-lg": return "text-base";
          default: return desktopSize;
        }
      }
      return desktopSize;
    }
  };
}

/**
 * Utility function to check if we're running in a Capacitor environment
 */
export function isCapacitorEnvironment(): boolean {
  return 'capacitor' in window;
}
