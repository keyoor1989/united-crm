
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EngineerItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  modelNumber: string | null;
  modelBrand: string | null;
  warehouseSource: string | null;
}

export const useEngineerItems = (engineerId: string) => {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['engineerItems', engineerId],
    queryFn: async () => {
      if (!engineerId) return [];
      
      const { data, error } = await supabase
        .from('engineer_inventory')
        .select('*')
        .eq('engineer_id', engineerId)
        .order('assigned_date', { ascending: false });
        
      if (error) {
        console.error('Error fetching engineer items:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} items for engineer ${engineerId}`);
      
      return data.map(item => ({
        id: item.id,
        item_id: item.item_id,
        item_name: item.item_name,
        quantity: item.quantity,
        modelNumber: item.model_number,
        modelBrand: item.model_brand,
        warehouseSource: item.warehouse_source
      })) as EngineerItem[];
    },
    enabled: !!engineerId,
    staleTime: 30000 // Consider data fresh for 30 seconds
  });

  return { items, isLoading, error };
};
