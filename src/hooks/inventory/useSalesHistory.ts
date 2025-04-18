
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSalesHistory = (itemName: string | null) => {
  return useQuery({
    queryKey: ['sales_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      
      try {
        // First get the item details from opening_stock_entries
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
        
        // Use ILIKE for more flexible matching
        const { data: salesItemsData, error: salesItemsError } = await supabase
          .from('sales_items')
          .select('id, sale_id, item_name, quantity, unit_price, total, category')
          .or(`item_name.ilike.%${stockEntry.part_name}%,item_name.ilike.%${itemName}%`);
        
        if (salesItemsError) {
          console.error('Error fetching sales items:', salesItemsError);
          return [];
        }
        
        if (!salesItemsData || salesItemsData.length === 0) {
          console.log('No sales found for item:', itemName);
          return [];
        }
        
        const saleIds = salesItemsData.map(item => item.sale_id);
        
        // Get the corresponding sales records
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('id, date, customer_name, status, payment_status')
          .in('id', saleIds);
        
        if (salesError) {
          console.error('Error fetching sales data:', salesError);
          return [];
        }
        
        return salesItemsData.map(item => ({
          ...item,
          sales: salesData?.find(sale => sale.id === item.sale_id) || { 
            date: null, 
            customer_name: 'Unknown', 
            status: 'unknown' 
          }
        }));
      } catch (error) {
        console.error('Unexpected error in useSalesHistory:', error);
        return [];
      }
    },
    enabled: !!itemName
  });
};
