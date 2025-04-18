
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReturnsHistory = (itemName: string | null) => {
  return useQuery({
    queryKey: ['returns_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      
      const { data: stockEntry } = await supabase
        .from('opening_stock_entries')
        .select('full_item_name')
        .eq('part_name', itemName)
        .single();
      
      if (!stockEntry) return [];
      
      const { data, error } = await supabase
        .from('inventory_returns')
        .select('*')
        .eq('item_name', stockEntry.full_item_name)
        .order('return_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!itemName
  });
};
