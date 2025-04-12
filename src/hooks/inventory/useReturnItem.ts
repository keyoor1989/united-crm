
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ReturnReason = "Unused" | "Defective" | "Wrong Item" | "Excess" | "Other";
export type ItemCondition = "Good" | "Damaged" | "Needs Inspection";

interface ReturnItemParams {
  engineerId: string;
  engineerName: string;
  engineerItemId: string;
  itemId: string;
  itemName: string;
  returnQuantity: number;
  warehouseId: string | null;
  warehouseName: string | null;
  reason: ReturnReason;
  condition: ItemCondition;
  notes?: string;
}

export const useReturnItem = () => {
  const queryClient = useQueryClient();

  const returnMutation = useMutation({
    mutationFn: async (params: ReturnItemParams) => {
      const {
        engineerId,
        engineerName,
        engineerItemId,
        itemId,
        itemName,
        returnQuantity,
        warehouseId,
        warehouseName,
        reason,
        condition,
        notes
      } = params;

      // 1. Get current item quantity from engineer inventory
      const { data: engineerItem, error: engineerItemError } = await supabase
        .from('engineer_inventory')
        .select('quantity')
        .eq('id', engineerItemId)
        .single();

      if (engineerItemError) throw new Error(engineerItemError.message);
      if (engineerItem.quantity < returnQuantity) {
        throw new Error(`Cannot return more than the available quantity (${engineerItem.quantity})`);
      }

      // 2. Add entry to inventory_returns
      const { error: returnError } = await supabase
        .from('inventory_returns')
        .insert({
          engineer_id: engineerId,
          engineer_name: engineerName,
          item_id: itemId,
          item_name: itemName,
          quantity: returnQuantity,
          warehouse_id: warehouseId,
          warehouse_name: warehouseName,
          reason,
          condition,
          notes
        });

      if (returnError) throw new Error(returnError.message);

      // 3. Update engineer inventory (reduce quantity or delete if zero)
      const remainingQuantity = engineerItem.quantity - returnQuantity;
      
      if (remainingQuantity <= 0) {
        const { error: deleteError } = await supabase
          .from('engineer_inventory')
          .delete()
          .eq('id', engineerItemId);
          
        if (deleteError) throw new Error(deleteError.message);
      } else {
        const { error: updateError } = await supabase
          .from('engineer_inventory')
          .update({ quantity: remainingQuantity })
          .eq('id', engineerItemId);
          
        if (updateError) throw new Error(updateError.message);
      }
      
      // 4. Update stock in opening_stock_entries (only if condition is good)
      if (condition === "Good") {
        const { data: stockData, error: stockError } = await supabase
          .from('opening_stock_entries')
          .select('quantity')
          .eq('id', itemId)
          .single();
          
        if (stockError) throw new Error(stockError.message);
        
        const { error: updateStockError } = await supabase
          .from('opening_stock_entries')
          .update({ quantity: stockData.quantity + returnQuantity })
          .eq('id', itemId);
          
        if (updateStockError) throw new Error(updateStockError.message);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.invalidateQueries({ queryKey: ['engineerInventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryReturns'] });
      toast.success("Item returned successfully");
    },
    onError: (error) => {
      toast.error(`Error returning item: ${error.message}`);
    }
  });

  return returnMutation;
};
