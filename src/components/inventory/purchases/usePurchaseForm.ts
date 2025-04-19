
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
    console.log("Starting purchase save with data:", {
      itemsCount: items.length,
      vendorId,
      vendorName,
      notes,
      purchaseType,
      invoiceNumber,
      purchaseDate,
      dueDate
    });

    // Validations
    if (items.length === 0) {
      toast.error("Please add at least one item to the purchase");
      return null;
    }

    if (purchaseType === 'credit' && !dueDate) {
      toast.error("Please select a due date for credit purchase");
      return null;
    }

    if (!vendorId && !vendorName) {
      toast.error("Please select a vendor or enter vendor name");
      return null;
    }
    
    if (!invoiceNumber) {
      toast.error("Please enter an invoice number");
      return null;
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

      console.log("Purchase save result:", result);

      if (result) {
        queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
        toast.success("Purchase saved successfully!");
        return result;
      }
      
      return null;
    } catch (error: any) {
      console.error("Complete error during purchase save:", error);
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
