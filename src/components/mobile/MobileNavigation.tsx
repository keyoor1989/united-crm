
import * as React from "react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface MobileNavigationProps {
  items: NavItem[];
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  className
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Hide on desktop
  if (!isMobile) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background border-t flex items-center justify-around h-16",
      className
    )}>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        
        return (
          <button
            key={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full px-2 py-1",
              "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => navigate(item.path)}
          >
            <div className={cn("mb-1", isActive ? "text-primary" : "text-muted-foreground")}>
              {item.icon}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
