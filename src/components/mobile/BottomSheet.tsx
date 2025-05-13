
import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showHandle?: boolean;
  snapPoints?: {
    collapsed: number;
    expanded: number;
  };
}

export const BottomSheet = ({
  open,
  onOpenChange,
  title,
  children,
  className,
  showHandle = true,
  snapPoints = { collapsed: 0.4, expanded: 0.9 },
}: BottomSheetProps) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) {
    // If not mobile, use regular Sheet but positioned bottom
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className={cn("sm:max-w-md sm:rounded-t-xl", className)}>
          {title && (
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
          )}
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className={cn(
          "fixed inset-x-0 bottom-0 rounded-t-[10px] border-t px-4",
          "h-[85vh] max-h-[85vh]", // Default height
          className
        )}
      >
        {showHandle && (
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-3" />
        )}
        {title && (
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
        )}
        <div className="mt-2 overflow-y-auto pb-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
};
