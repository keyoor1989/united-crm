
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEngineerAssignmentHistory = (itemName: string | null) => {
  return useQuery({
    queryKey: ['engineer_assignment_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      
      try {
        // Get all engineer inventory records that match this item
        const { data, error } = await supabase
          .from('engineer_inventory')
          .select('id, engineer_id, engineer_name, quantity, assigned_date, item_name, item_id, warehouse_source')
          .or(`item_name.ilike.%${itemName}%,item_id.eq.${itemName}`)
          .order('assigned_date', { ascending: false });
        
        if (error) {
          console.error('Error fetching engineer assignment history:', error);
          return [];
        }
        
        return data.map(item => ({
          ...item,
          service_case_id: 'N/A' // Add the missing field with a default value
        })) || [];
      } catch (error) {
        console.error('Unexpected error in useEngineerAssignmentHistory:', error);
        return [];
      }
    },
    enabled: !!itemName
  });
};
