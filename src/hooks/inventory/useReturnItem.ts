
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

      // 1. Verify the engineer actually has this item assigned
      const { data: engineerItem, error: engineerItemError } = await supabase
        .from('engineer_inventory')
        .select('*')
        .eq('id', engineerItemId)
        .eq('engineer_id', engineerId)
        .single();

      if (engineerItemError) {
        console.error('Error verifying engineer inventory:', engineerItemError);
        throw new Error('Could not verify if engineer has this item. Please try again.');
      }

      if (!engineerItem) {
        console.error('Item not found in engineer inventory');
        throw new Error(`This item was not assigned to ${engineerName}`);
      }

      // 2. Check quantity validation
      if (engineerItem.quantity < returnQuantity) {
        throw new Error(`Cannot return more than the available quantity (${engineerItem.quantity})`);
      }

      // 3. Add entry to inventory_returns with verified item_id from engineer inventory
      const { error: returnError } = await supabase
        .from('inventory_returns')
        .insert({
          engineer_id: engineerId,
          engineer_name: engineerName,
          item_id: engineerItem.item_id, // Use the verified item_id from engineer inventory
          item_name: engineerItem.item_name,
          quantity: returnQuantity,
          warehouse_id: warehouseId,
          warehouse_name: warehouseName,
          reason,
          condition,
          notes
        });

      if (returnError) {
        console.error('Error adding inventory return:', returnError);
        throw new Error('Failed to record return. Please try again.');
      }

      // 4. Update engineer inventory (reduce quantity or delete if zero)
      const remainingQuantity = engineerItem.quantity - returnQuantity;
      
      if (remainingQuantity <= 0) {
        const { error: deleteError } = await supabase
          .from('engineer_inventory')
          .delete()
          .eq('id', engineerItemId);
          
        if (deleteError) {
          console.error('Error removing item from engineer inventory:', deleteError);
          throw new Error('Failed to update engineer inventory. Please try again.');
        }
      } else {
        const { error: updateError } = await supabase
          .from('engineer_inventory')
          .update({ quantity: remainingQuantity })
          .eq('id', engineerItemId);
          
        if (updateError) {
          console.error('Error updating engineer inventory quantity:', updateError);
          throw new Error('Failed to update engineer inventory quantity. Please try again.');
        }
      }
      
      // 5. Update stock in opening_stock_entries (only if condition is good)
      if (condition === "Good") {
        const { data: stockData, error: stockError } = await supabase
          .from('opening_stock_entries')
          .select('quantity')
          .eq('id', engineerItem.item_id) // Use the verified item_id from engineer inventory
          .single();
          
        if (stockError) {
          console.error('Error fetching current stock:', stockError);
          throw new Error('Failed to update main inventory. Please try again.');
        }
        
        const { error: updateStockError } = await supabase
          .from('opening_stock_entries')
          .update({ quantity: stockData.quantity + returnQuantity })
          .eq('id', engineerItem.item_id); // Use the verified item_id from engineer inventory
          
        if (updateStockError) {
          console.error('Error updating stock quantity:', updateStockError);
          throw new Error('Failed to update main inventory quantity. Please try again.');
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.invalidateQueries({ queryKey: ['engineerInventory'] });
      queryClient.invalidateQueries({ queryKey: ['engineer_assignment_history'] });
      queryClient.invalidateQueries({ queryKey: ['returns_history'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryReturns'] });
      toast.success("Item returned successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error returning item: ${error.message}`);
    }
  });

  return returnMutation;
};
