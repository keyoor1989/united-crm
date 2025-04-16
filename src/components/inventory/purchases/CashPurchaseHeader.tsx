
import React from "react";
import { Button } from "@/components/ui/button";
import { Banknote, Calendar } from "lucide-react";

interface CashPurchaseHeaderProps {
  date: string;
  onDateChange: (date: string) => void;
}

export const CashPurchaseHeader: React.FC<CashPurchaseHeaderProps> = ({
  date,
  onDateChange,
}) => {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Cash Purchase Entry</h2>
        <p className="text-muted-foreground">
          Record cash purchases for inventory with minimal details
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Banknote className="h-4 w-4" />
          Cash Purchase
        </Button>
      </div>
    </div>
  );
};
