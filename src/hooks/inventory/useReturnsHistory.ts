
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReturnsHistory = (itemName: string | null) => {
  return useQuery({
    queryKey: ['returns_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      
      try {
        console.log('Fetching returns history for item:', itemName);
        
        // Step 1: Get the item details from opening_stock_entries
        const { data: stockItem, error: stockError } = await supabase
          .from('opening_stock_entries')
          .select('id, part_name, full_item_name')
          .or(`part_name.ilike.%${itemName}%,full_item_name.ilike.%${itemName}%`)
          .limit(1)
          .maybeSingle();
        
        if (stockError) {
          console.error('Error fetching item details:', stockError);
          return [];
        }
        
        if (!stockItem) {
          console.log('No matching item found in stock entries for:', itemName);
          return [];
        }
        
        console.log('Found item details:', stockItem);
        
        // Step 2: Query inventory_returns by exact item_id match only
        if (!stockItem.id) {
          console.log('No item ID available for matching, cannot proceed with accurate returns lookup');
          return [];
        }
        
        // Only query by exact item_id match - no fuzzy text matching
        const { data, error } = await supabase
          .from('inventory_returns')
          .select('*')
          .eq('item_id', stockItem.id)
          .order('return_date', { ascending: false });
        
        if (error) {
          console.error('Error fetching returns history:', error);
          return [];
        }
        
        console.log(`Found ${data?.length || 0} returns records for item ID ${stockItem.id}`);
        
        return data || [];
      } catch (error) {
        console.error('Unexpected error in useReturnsHistory:', error);
        return [];
      }
    },
    enabled: !!itemName
  });
};
