
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useVendors } from "@/contexts/VendorContext";
import { Loader2 } from "lucide-react";
import { useInventoryItems } from "@/hooks/inventory/useInventoryItems";
import UnifiedPurchaseForm from "@/components/inventory/purchases/UnifiedPurchaseForm";
import PurchaseHeader from "@/components/inventory/purchases/PurchaseHeader";
import { PurchaseTabs } from "@/components/inventory/purchases/PurchaseTabs";

export type GstMode = 'no-gst' | 'exclusive' | 'inclusive';

export interface PurchaseItem {
  id: string;
  itemId?: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  category: string;
  isCustomItem: boolean;
  gstPercent: number;
  gstAmount: number;
  // Add brand and model properties
  brand?: string;
  model?: string;
  specs?: {
    brand?: string;
    model?: string;
    partNumber?: string;
    minStock?: number;
    [key: string]: any;
  };
}

const UnifiedPurchase = () => {
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [purchaseType, setPurchaseType] = useState<'cash' | 'credit'>('cash');
  const [gstMode, setGstMode] = useState<GstMode>('no-gst');
  const [gstRate, setGstRate] = useState<number>(18);
  
  const { vendors, loading: vendorsLoading } = useVendors();
  const { items: inventoryItems, isLoading: inventoryLoading } = useInventoryItems(null);

  const categories = [...new Set(inventoryItems?.map(item => item.category))];

  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>{purchaseType === 'cash' ? 'Cash Purchase' : 'Credit Purchase'} | Inventory Management</title>
      </Helmet>

      <PurchaseHeader 
        date={purchaseDate} 
        onDateChange={setPurchaseDate}
        purchaseType={purchaseType}
        onPurchaseTypeChange={setPurchaseType}
      />

      <PurchaseTabs>
        {vendorsLoading || inventoryLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Loading data...</span>
          </div>
        ) : (
          <UnifiedPurchaseForm
            vendors={vendors}
            inventoryItems={inventoryItems}
            categories={categories}
            purchaseType={purchaseType}
            gstMode={gstMode}
            gstRate={gstRate}
            onGstModeChange={setGstMode}
            onGstRateChange={setGstRate}
            purchaseDate={purchaseDate}
          />
        )}
      </PurchaseTabs>
    </div>
  );
};

export default UnifiedPurchase;
