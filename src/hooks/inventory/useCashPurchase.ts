
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { CashPurchaseItemData } from "@/types/sales";
import { supabase } from "@/integrations/supabase/client";

interface SavedCashPurchase {
  id: string;
  date: string;
  vendorName: string;
  items: CashPurchaseItemData[];
  totalAmount: number;
  notes?: string;
}

export const useCashPurchase = () => {
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [savedPurchases, setSavedPurchases] = useState<SavedCashPurchase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // List of product categories
  const categories = [
    "Toner",
    "Drum Unit",
    "Developer",
    "Fuser",
    "Paper Feed",
    "Machine Parts",
    "Lamination",
    "Badge Making",
    "Other",
  ];

  const saveCashPurchase = async (
    items: CashPurchaseItemData[],
    vendorName: string,
    notes: string
  ) => {
    try {
      setIsLoading(true);
      
      const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);
      
      const newPurchase: SavedCashPurchase = {
        id: uuidv4(),
        date: purchaseDate,
        vendorName,
        items,
        totalAmount,
        notes: notes || undefined,
      };

      // In a real app, we would save to Supabase here
      // const { error } = await supabase
      //   .from('purchase_orders')
      //   .insert({
      //     po_number: `CP-${Date.now()}`,
      //     vendor_name: vendorName,
      //     items: items,
      //     subtotal: totalAmount,
      //     total_gst: 0,
      //     grand_total: totalAmount,
      //     status: 'Cash Purchase',
      //     created_at: new Date(purchaseDate).toISOString(),
      //     notes: notes || null
      //   });

      // For now, just update local state
      setSavedPurchases((prev) => [newPurchase, ...prev]);
      
      // Also update inventory quantities (in a real app)
      // for (const item of items) {
      //   // Update stock quantities in opening_stock_entries or similar
      // }

      return true;
    } catch (error) {
      console.error("Error saving cash purchase:", error);
      toast.error("Failed to save cash purchase");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    purchaseDate,
    setPurchaseDate,
    savedPurchases,
    categories,
    isLoading,
    saveCashPurchase,
  };
};
