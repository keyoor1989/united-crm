
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

export interface MobileCardListItemProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  rightContent?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  badge?: React.ReactNode;
  disabled?: boolean;
}

interface MobileCardListProps {
  items: MobileCardListItemProps[];
  className?: string;
}

export const MobileCardListItem = ({
  title,
  description,
  icon,
  rightContent,
  onClick,
  href,
  badge,
  disabled = false
}: MobileCardListItemProps) => {
  const Component = href ? "a" : "button";
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        disabled 
          ? "pointer-events-none opacity-50" 
          : "hover:bg-accent/50 active:bg-accent"
      )}
      disabled={disabled}
    >
      <div className="flex items-center gap-3">
        {icon && <div className="flex-shrink-0 text-muted-foreground">{icon}</div>}
        <div>
          <div className="font-medium">{title}</div>
          {description && <div className="text-sm text-muted-foreground">{description}</div>}
        </div>
        {badge && <div className="ml-2">{badge}</div>}
      </div>
      {rightContent ? (
        <div>{rightContent}</div>
      ) : href ? (
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      ) : null}
    </Component>
  );
};

export const MobileCardList = ({ items, className }: MobileCardListProps) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) {
    // Fallback to regular cards on desktop
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {items.map((item, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardContent className="p-0">
              <MobileCardListItem {...item} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0 divide-y">
        {items.map((item, idx) => (
          <MobileCardListItem key={idx} {...item} />
        ))}
      </CardContent>
    </Card>
  );
};
