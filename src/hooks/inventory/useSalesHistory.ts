
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSalesHistory = (itemName: string | null) => {
  return useQuery({
    queryKey: ['sales_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      
      try {
        console.log('Fetching sales history for item:', itemName);
        
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
        
        // Step 2: Query sales_items using both item_id and name matching
        const query = supabase
          .from('sales_items')
          .select('id, sale_id, item_name, item_id, quantity, unit_price, total, category');
          
        // If we found the item in opening_stock_entries, use its ID for matching
        if (stockItem?.id) {
          query.or(`item_id.eq.${stockItem.id},item_name.ilike.%${itemName}%`)
        } else {
          // Fallback to flexible name matching
          query.or(`item_name.ilike.%${itemName}%`);
        }
        
        const { data: salesItems, error: salesItemsError } = await query;
        
        if (salesItemsError) {
          console.error('Error fetching sales items:', salesItemsError);
          return [];
        }
        
        console.log(`Found ${salesItems?.length || 0} sales item records`);
        
        if (!salesItems || salesItems.length === 0) {
          return [];
        }
        
        // Step 3: Get the corresponding sales records
        const saleIds = salesItems.map(item => item.sale_id).filter(Boolean);
        
        if (saleIds.length === 0) {
          return salesItems.map(item => ({
            ...item,
            sales: { date: null, customer_name: 'Unknown', status: 'unknown' }
          }));
        }
        
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('id, date, customer_name, status, payment_status')
          .in('id', saleIds);
        
        if (salesError) {
          console.error('Error fetching sales data:', salesError);
          return salesItems.map(item => ({
            ...item,
            sales: { date: null, customer_name: 'Unknown', status: 'unknown' }
          }));
        }
        
        // Step 4: Combine sales items with their corresponding sale details
        return salesItems.map(item => ({
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
