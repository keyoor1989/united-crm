
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EngineerInventoryItem {
  id: string;
  engineer_id: string;
  engineer_name: string;
  item_id: string;
  item_name: string;
  quantity: number;
  assigned_date: string;
  warehouse_id?: string;
  warehouse_source?: string;
}

export const useEngineerItems = (engineerId: string | null) => {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['engineerInventory', engineerId],
    queryFn: async () => {
      if (!engineerId) return [];
      
      const { data, error } = await supabase
        .from('engineer_inventory')
        .select('*')
        .eq('engineer_id', engineerId);
        
      if (error) throw error;
      return data as EngineerInventoryItem[];
    },
    enabled: !!engineerId
  });

  return { items, isLoading, error };
};

export const useIssuedItems = () => {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['allIssuedItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engineer_inventory')
        .select('*')
        .order('assigned_date', { ascending: false });
        
      if (error) throw error;
      return data as EngineerInventoryItem[];
    }
  });

  return { items, isLoading, error };
};
