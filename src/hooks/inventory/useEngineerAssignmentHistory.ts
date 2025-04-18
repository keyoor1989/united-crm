
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEngineerAssignmentHistory = (itemName: string | null) => {
  return useQuery({
    queryKey: ['engineer_assignments', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      
      const { data: stockEntry } = await supabase
        .from('opening_stock_entries')
        .select('full_item_name')
        .eq('part_name', itemName)
        .single();
      
      if (!stockEntry) return [];
      
      const { data, error } = await supabase
        .from('engineer_inventory')
        .select('*')
        .eq('item_name', stockEntry.full_item_name)
        .order('assigned_date', { ascending: false });
      
      if (error) {
        console.error('Engineer assignments error:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!itemName
  });
};
