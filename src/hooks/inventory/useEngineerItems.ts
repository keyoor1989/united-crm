
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
  engineer_id?: string;
  engineer_name?: string;
  return_date?: string;
}

export const useEngineerItems = (engineerId: string) => {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['engineerItems', engineerId],
    queryFn: async () => {
      let query = supabase
        .from('engineer_inventory')
        .select('*')
        .order('created_at', { ascending: false });
        
      // Only filter by engineer_id if it's provided
      if (engineerId) {
        query = query.eq('engineer_id', engineerId);
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error('Error fetching engineer items:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} items ${engineerId ? `for engineer ${engineerId}` : 'for all engineers'}`);
      
      return data.map(item => ({
        id: item.id,
        item_id: item.item_id,
        item_name: item.item_name,
        quantity: item.quantity,
        modelNumber: item.model_number,
        modelBrand: item.model_brand,
        warehouseSource: item.warehouse_source,
        engineer_id: item.engineer_id,
        engineer_name: item.engineer_name,
        return_date: item.assigned_date
      })) as EngineerItem[];
    },
    staleTime: 30000 // Consider data fresh for 30 seconds
  });

  return { items, isLoading, error };
};
