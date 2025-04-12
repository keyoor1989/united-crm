
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReturnReason, ItemCondition } from "./useReturnItem";

export interface InventoryReturnItem {
  id: string;
  engineer_id: string;
  engineer_name: string;
  item_id: string;
  item_name: string;
  quantity: number;
  return_date: string;
  warehouse_id?: string;
  warehouse_name?: string;
  reason: ReturnReason;
  condition: ItemCondition;
  notes?: string;
}

export const useReturnedItems = () => {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['inventoryReturns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_returns')
        .select('*')
        .order('return_date', { ascending: false });
        
      if (error) throw error;
      return data as InventoryReturnItem[];
    }
  });

  return { items, isLoading, error };
};
