
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface MobileCompatibilityWarningProps {
  pageName: string;
}

export const MobileCompatibilityWarning = ({ pageName }: MobileCompatibilityWarningProps) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Mobile Compatibility Notice</AlertTitle>
      <AlertDescription>
        The {pageName} page has not been fully optimized for mobile view yet. You may experience some display issues.
      </AlertDescription>
    </Alert>
  );
};
