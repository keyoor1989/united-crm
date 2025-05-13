
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface MobileFormLayoutProps {
  title: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  footer?: React.ReactNode;
  isLoading?: boolean;
  onBack?: () => void;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  className?: string;
}

export const MobileFormLayout = ({
  title,
  children,
  onSubmit,
  footer,
  isLoading = false,
  onBack,
  submitText = "Save",
  cancelText = "Cancel",
  onCancel,
  className
}: MobileFormLayoutProps) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="relative px-4 py-4 border-b">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 h-9 w-9"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        )}
        <h2 className="text-lg font-semibold text-center">{title}</h2>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {children}
          {!footer && (onSubmit || onCancel) && (
            <div className="flex flex-col gap-2 sm:flex-row pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="sm:w-full h-12 sm:h-10"
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
              )}
              {onSubmit && (
                <Button
                  type="submit"
                  className="sm:w-full h-12 sm:h-10"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {submitText}
                </Button>
              )}
            </div>
          )}
        </form>
      </CardContent>
      {footer && <CardFooter className="px-4 py-4 border-t">{footer}</CardFooter>}
    </Card>
  );
};
