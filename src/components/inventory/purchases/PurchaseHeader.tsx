
import React from "react";
import { Button } from "@/components/ui/button";
import { Banknote, Calendar, CreditCard } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PurchaseHeaderProps {
  date: string;
  onDateChange: (date: string) => void;
  purchaseType: 'cash' | 'credit';
  onPurchaseTypeChange: (type: 'cash' | 'credit') => void;
}

export default function PurchaseHeader({
  date,
  onDateChange,
  purchaseType,
  onPurchaseTypeChange,
}: PurchaseHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Purchase Entry</h2>
        <p className="text-muted-foreground">
          Record inventory purchases with vendor details and GST handling
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="h-5 w-5 text-gray-500" />
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-full"
          />
        </div>
        <Tabs 
          value={purchaseType} 
          onValueChange={(value) => onPurchaseTypeChange(value as 'cash' | 'credit')} 
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="cash" className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Cash
            </TabsTrigger>
            <TabsTrigger value="credit" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Credit
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
