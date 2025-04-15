
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

interface SalesHeaderProps {
  onNewSale: () => void;
  onExportData: () => void;
}

export const SalesHeader: React.FC<SalesHeaderProps> = ({
  onNewSale,
  onExportData,
}) => {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sales Management</h2>
        <p className="text-muted-foreground">
          Manage your product sales, generate invoices, and track payments.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onNewSale} className="gap-2">
          <Plus size={16} />
          New Sale
        </Button>
        <Button variant="outline" onClick={onExportData} className="gap-2">
          <Download size={16} />
          Export
        </Button>
      </div>
    </div>
  );
};
