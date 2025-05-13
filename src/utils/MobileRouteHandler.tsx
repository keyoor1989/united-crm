
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { isCapacitorEnvironment } from "@/utils/mobileCompatibility";

interface MobileRouteHandlerProps {
  mobileComponent: React.ComponentType;
  desktopComponent: React.ComponentType;
}

export const MobileRouteHandler: React.FC<MobileRouteHandlerProps> = ({ 
  mobileComponent: MobileComponent, 
  desktopComponent: DesktopComponent 
}) => {
  const isMobile = useIsMobile();
  const isNative = isCapacitorEnvironment();
  
  // Always use the mobile component when in a Capacitor native environment
  if (isNative) {
    return <MobileComponent />;
  }
  
  // Use mobile component on mobile web, desktop component otherwise
  return isMobile ? <MobileComponent /> : <DesktopComponent />;
};

export default MobileRouteHandler;
