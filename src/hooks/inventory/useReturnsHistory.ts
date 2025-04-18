
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
        
        console.log('Found item details:', stockItem);
        
        // Step 2: Query inventory_returns using both item_id and name matching
        const query = supabase
          .from('inventory_returns')
          .select('*')
          .order('return_date', { ascending: false });
          
        // If we found the item in opening_stock_entries, use its ID for matching
        if (stockItem?.id) {
          query.or(`item_id.eq.${stockItem.id},item_name.ilike.%${itemName}%`);
        } else {
          // Fallback to flexible name matching
          query.or(`item_name.ilike.%${itemName}%`);
          
          // Add part_name matching if available
          if (stockItem?.part_name) {
            query.or(`item_name.ilike.%${stockItem.part_name}%`);
          }
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching returns history:', error);
          return [];
        }
        
        console.log(`Found ${data?.length || 0} returns records`);
        
        return data || [];
      } catch (error) {
        console.error('Unexpected error in useReturnsHistory:', error);
        return [];
      }
    },
    enabled: !!itemName
  });
};
