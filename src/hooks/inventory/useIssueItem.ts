
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
  modelNumber: string | null;
  modelBrand: string | null;
}

export const useIssueItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: IssueItemParams) => {
      console.log("Issuing item with params:", params);
      
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
          warehouse_source: params.warehouseName,
          model_number: params.modelNumber,
          model_brand: params.modelBrand
        })
        .select();
      
      if (error) {
        console.error("Error inserting into engineer_inventory:", error);
        throw error;
      }
      
      console.log("Successfully inserted into engineer_inventory:", data);
      
      // Update the stock in the opening_stock_entries table
      if (params.itemId) {
        // Get the current item
        const { data: itemData, error: itemError } = await supabase
          .from('opening_stock_entries')
          .select('quantity')
          .eq('id', params.itemId)
          .single();
          
        if (itemError) {
          console.error("Error fetching item quantity:", itemError);
          throw itemError;
        }
        
        // Ensure itemData is not null and has quantity property before calculating
        if (!itemData || typeof itemData.quantity !== 'number') {
          throw new Error('Invalid item data received');
        }
        
        console.log("Current quantity before update:", itemData.quantity);
        
        // Calculate new quantity, ensuring we don't go below zero
        const newQuantity = Math.max(0, itemData.quantity - params.quantity);
        console.log("New quantity to set:", newQuantity);
        
        // Update the quantity
        const { error: updateError } = await supabase
          .from('opening_stock_entries')
          .update({ quantity: newQuantity })
          .eq('id', params.itemId);
        
        if (updateError) {
          console.error("Error updating stock quantity:", updateError);
          throw updateError;
        }
        
        console.log("Successfully updated stock quantity to:", newQuantity);
      } else {
        console.error("No item ID provided for inventory update");
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.invalidateQueries({ queryKey: ['engineer_inventory'] });
      queryClient.invalidateQueries({ queryKey: ['sales_inventory_items'] });
      
      toast.success("Inventory updated successfully");
    },
    onError: (error) => {
      console.error('Error issuing item:', error);
      toast.error("Failed to update inventory. Please try again.");
    }
  });
};
