
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSalesHistory = (itemName: string | null) => {
  return useQuery({
    queryKey: ['sales_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      
      const { data: stockEntry } = await supabase
        .from('opening_stock_entries')
        .select('full_item_name')
        .eq('part_name', itemName)
        .single();
      
      if (!stockEntry) return [];
      
      const { data: salesItemsData, error: salesItemsError } = await supabase
        .from('sales_items')
        .select('id, sale_id, item_name, quantity, unit_price, total, category')
        .eq('item_name', stockEntry.full_item_name);
      
      if (salesItemsError) throw salesItemsError;
      
      if (!salesItemsData || salesItemsData.length === 0) return [];
      
      const saleIds = salesItemsData.map(item => item.sale_id);
      
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('id, date, customer_name, status, payment_status')
        .in('id', saleIds);
      
      if (salesError) throw salesError;
      
      return salesItemsData.map(item => ({
        ...item,
        sales: salesData?.find(sale => sale.id === item.sale_id) || { 
          date: null, 
          customer_name: 'Unknown', 
          status: 'unknown' 
        }
      }));
    },
    enabled: !!itemName
  });
};
