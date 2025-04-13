
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InventoryItem } from "@/types/inventory";

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
  
  return useMutation({
    mutationFn: async (params: IssueItemParams) => {
      // Insert into engineer_inventory table
      const { data, error } = await supabase
        .from('engineer_inventory')
        .insert({
          engineer_id: params.engineerId,
          engineer_name: params.engineerName,
          item_id: params.itemId,
          item_name: params.itemName,
          quantity: params.quantity,
          warehouse_id: params.warehouseId,
          warehouse_source: params.warehouseName
        })
        .select();
      
      if (error) throw error;
      
      // Update the stock in the opening_stock_entries table
      if (params.itemId) {
        // Get the current item
        const { data: itemData, error: itemError } = await supabase
          .from('opening_stock_entries')
          .select('quantity')
          .eq('id', params.itemId)
          .single();
          
        if (itemError) throw itemError;
        
        // Calculate new quantity
        const newQuantity = (itemData.quantity - params.quantity);
        
        // Update the quantity
        const { error: updateError } = await supabase
          .from('opening_stock_entries')
          .update({ quantity: newQuantity })
          .eq('id', params.itemId);
        
        if (updateError) throw updateError;
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.invalidateQueries({ queryKey: ['engineer_inventory'] });
      
      toast.success("Item issued successfully");
    },
    onError: (error) => {
      console.error('Error issuing item:', error);
      toast.error("Failed to issue item. Please try again.");
    }
  });
};
