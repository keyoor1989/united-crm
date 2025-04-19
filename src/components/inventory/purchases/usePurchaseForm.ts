
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { purchaseService } from "@/services/purchaseService";
import { PurchaseItem, GstMode } from "@/pages/inventory/UnifiedPurchase";
import { toast } from "sonner";

export function usePurchaseForm() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSavePurchase = async (
    items: PurchaseItem[], 
    vendorId: string, 
    vendorName: string,
    notes: string,
    purchaseType: 'cash' | 'credit',
    invoiceNumber: string,
    purchaseDate: string,
    dueDate?: string
  ) => {
    if (items.length === 0) {
      toast.error("Please add at least one item to the purchase");
      return;
    }

    if (purchaseType === 'credit' && !dueDate) {
      toast.error("Please select a due date for credit purchase");
      return;
    }

    if (!vendorId && !vendorName) {
      toast.error("Please select a vendor or enter vendor name");
      return;
    }
    
    if (!invoiceNumber) {
      toast.error("Please enter an invoice number");
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await purchaseService.savePurchase({
        items,
        vendorId,
        vendorName,
        notes,
        purchaseType,
        invoiceNumber,
        purchaseDate,
        dueDate
      });

      if (result) {
        // Invalidate queries to refresh inventory data
        queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
        toast.success("Purchase saved successfully!");
        return result;
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(`Failed to save purchase: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSavePurchase
  };
}
