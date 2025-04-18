
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReturnsHistory = (itemName: string | null) => {
  return useQuery({
    queryKey: ['returns_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      
      try {
        // Get the item details from opening_stock_entries
        const { data: stockEntry, error: stockError } = await supabase
          .from('opening_stock_entries')
          .select('part_name, full_item_name')
          .eq('part_name', itemName)
          .single();
        
        if (stockError) {
          console.error('Error fetching stock entry:', stockError);
          return [];
        }
        
        if (!stockEntry) {
          console.error('No stock entry found for item:', itemName);
          return [];
        }
        
        // Use more flexible matching with ILIKE
        const { data, error } = await supabase
          .from('inventory_returns')
          .select('*')
          .or(`item_name.ilike.%${stockEntry.part_name}%,item_name.ilike.%${itemName}%`)
          .order('return_date', { ascending: false });
        
        if (error) {
          console.error('Error fetching returns history:', error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error('Unexpected error in useReturnsHistory:', error);
        return [];
      }
    },
    enabled: !!itemName
  });
};
