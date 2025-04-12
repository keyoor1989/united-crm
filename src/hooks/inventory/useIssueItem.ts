
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem } from "./useInventoryItems";
import { toast } from "sonner";

interface IssueItemParams {
  itemId: string;
  engineerId: string;
  engineerName: string;
  itemName: string;
  quantity: number;
  warehouseId: string | null;
  warehouseName: string | null;
}

export const useIssueItem = () => {
  const queryClient = useQueryClient();

  const issueMutation = useMutation({
    mutationFn: async (params: IssueItemParams) => {
      const { itemId, engineerId, engineerName, itemName, quantity, warehouseId, warehouseName } = params;

      // Check current item stock
      const { data: itemData, error: itemError } = await supabase
        .from('opening_stock_entries')
        .select('quantity')
        .eq('id', itemId)
        .single();

      if (itemError) throw new Error(itemError.message);
      if (itemData.quantity < quantity) {
        throw new Error(`Not enough items in stock. Only ${itemData.quantity} available.`);
      }

      // 1. Add to engineer inventory
      const { error: issueError } = await supabase
        .from('engineer_inventory')
        .insert({
          engineer_id: engineerId,
          engineer_name: engineerName,
          item_id: itemId,
          item_name: itemName,
          quantity,
          warehouse_id: warehouseId,
          warehouse_source: warehouseName
        });

      if (issueError) throw new Error(issueError.message);

      // 2. Update stock quantity
      const { error: updateError } = await supabase
        .from('opening_stock_entries')
        .update({
          quantity: itemData.quantity - quantity
        })
        .eq('id', itemId);

      if (updateError) throw new Error(updateError.message);

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.invalidateQueries({ queryKey: ['engineerInventory'] });
      toast.success("Item issued successfully");
    },
    onError: (error) => {
      toast.error(`Error issuing item: ${error.message}`);
    }
  });

  return issueMutation;
};
