
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePurchaseHistory = (itemName: string | null) => {
  return useQuery({
    queryKey: ['purchase_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .contains('items', [{ item_name: itemName }])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(po => {
        const itemsArray = typeof po.items === 'string' ? JSON.parse(po.items) : po.items;
        const itemDetails = Array.isArray(itemsArray) 
          ? itemsArray.find((item: any) => item.item_name === itemName)
          : null;
          
        if (!itemDetails) return null;
        
        return {
          id: po.id,
          date: po.created_at,
          vendor: po.vendor_name,
          quantity: itemDetails?.quantity || 0,
          rate: itemDetails?.unit_price || 0,
          invoiceNo: po.po_number
        };
      }).filter(Boolean) || [];
    },
    enabled: !!itemName
  });
};
