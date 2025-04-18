
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEngineerAssignmentHistory = (itemName: string | null) => {
  return useQuery({
    queryKey: ['engineer_assignment_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      
      try {
        console.log('Fetching engineer assignment history for item:', itemName);
        
        // First get the item details
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
        
        if (!stockItem?.id) {
          console.log('Item not found in stock entries:', itemName);
        } else {
          console.log('Found item in stock:', stockItem.id, stockItem.part_name);
        }
        
        // Query engineer_inventory primarily by item_id
        let query = supabase
          .from('engineer_inventory')
          .select(`
            id,
            engineer_id,
            engineer_name,
            quantity,
            assigned_date,
            item_name,
            item_id,
            warehouse_source,
            model_number,
            model_brand
          `)
          .order('assigned_date', { ascending: false });
          
        if (stockItem?.id) {
          // If we have a stock item ID, prioritize matching on item_id
          query = query.eq('item_id', stockItem.id);
        } else {
          // Fallback to name-based search if item ID not found
          query = query.ilike('item_name', `%${itemName}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching engineer assignment history:', error);
          return [];
        }
        
        console.log(`Found ${data?.length || 0} engineer assignment records`);
        
        return data || [];
      } catch (error) {
        console.error('Unexpected error in useEngineerAssignmentHistory:', error);
        return [];
      }
    },
    enabled: !!itemName
  });
};
