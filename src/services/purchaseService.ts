
import { supabase } from "@/integrations/supabase/client";
import { PurchaseItem } from "@/pages/inventory/UnifiedPurchase";
import { toast } from "sonner";
import { purchaseOrderService } from "./purchaseOrderService";

export interface SavePurchaseParams {
  items: PurchaseItem[];
  vendorId: string;
  vendorName: string;
  notes: string;
  purchaseType: 'cash' | 'credit';
  invoiceNumber: string;
  purchaseDate: string;
  dueDate?: string;
}

export const purchaseService = {
  async savePurchase({
    items,
    vendorId,
    vendorName,
    notes,
    purchaseType,
    invoiceNumber,
    purchaseDate,
    dueDate
  }: SavePurchaseParams) {
    try {
      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.totalAmount, 0);
      const totalGst = items.reduce((sum, item) => sum + (item.gstAmount || 0), 0);
      const grandTotal = subtotal + totalGst;

      // Generate PO number
      const poNumber = await purchaseOrderService.generatePurchaseOrderNumber();

      // Ensure each item has brand/model information correctly structured
      const processedItems = items.map(item => {
        // For custom items, the brand is often stored in specs
        const brand = item.specs?.brand || '';
        const model = item.specs?.model || '';
        
        return {
          ...item,
          // Ensure brand is directly available on item object
          brand: brand,
          // Ensure model is directly available on item object
          model: model,
          specs: {
            ...item.specs,
            brand: brand,
            model: model
          }
        };
      });

      console.log("Saving purchase order with processed items:", processedItems);

      // Create purchase record
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchase_orders')
        .insert({
          po_number: poNumber,
          vendor_id: vendorId || null,
          vendor_name: vendorName,
          items: JSON.stringify(processedItems),
          subtotal,
          total_gst: totalGst,
          grand_total: grandTotal,
          delivery_date: purchaseDate,
          status: purchaseType === 'cash' ? 'Cash Purchase' : 'Credit Purchase',
          notes,
          invoice_number: invoiceNumber,
          due_date: dueDate || null,
          payment_status: purchaseType === 'cash' ? 'Paid' : 'Due',
          payment_method: purchaseType === 'cash' ? 'Cash' : 'Credit'
        })
        .select();

      if (purchaseError) throw purchaseError;

      // Update inventory quantities
      for (const item of items) {
        if (!item.isCustomItem && item.itemId) {
          const { data: currentItem, error: fetchError } = await supabase
            .from('opening_stock_entries')
            .select('quantity')
            .eq('id', item.itemId)
            .single();
            
          if (fetchError) {
            console.error("Error fetching current inventory:", fetchError);
            continue;
          }
            
          const newQuantity = (currentItem?.quantity || 0) + item.quantity;
          
          const { error: updateError } = await supabase
            .from('opening_stock_entries')
            .update({ quantity: newQuantity })
            .eq('id', item.itemId);

          if (updateError) {
            console.error("Error updating inventory:", updateError);
          }
        } else if (item.isCustomItem) {
          const newItem = {
            part_name: item.itemName,
            category: item.category,
            quantity: item.quantity,
            purchase_price: item.unitPrice,
            min_stock: item.specs?.minStock || 5,
            brand: item.specs?.brand || "Generic",
            part_number: item.specs?.partNumber || "",
            full_item_name: item.itemName
          };
          
          const { error: insertError } = await supabase
            .from('opening_stock_entries')
            .insert(newItem);

          if (insertError) {
            console.error("Error adding new item to inventory:", insertError);
          }
        }
      }

      return purchaseData;
    } catch (error: any) {
      console.error("Error saving purchase:", error);
      throw error;
    }
  }
};
