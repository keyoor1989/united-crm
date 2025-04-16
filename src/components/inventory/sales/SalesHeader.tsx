
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download } from "lucide-react";

interface SalesHeaderProps {
  onNewSale: () => void;
  onExportData: () => void;
  title?: string;
}

export const SalesHeader: React.FC<SalesHeaderProps> = ({ 
  onNewSale, 
  onExportData,
  title = "Sales Management"
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">
          Manage your sales and track payment status
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onExportData}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button onClick={onNewSale}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>
    </div>
  );
};
