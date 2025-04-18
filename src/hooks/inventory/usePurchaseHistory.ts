
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePurchaseHistory = (itemName: string | null) => {
  return useQuery({
    queryKey: ['purchase_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      
      try {
        // This will use more flexible matching including ILIKE and fallbacks
        const { data, error } = await supabase
          .from('purchase_orders')
          .select('*')
          .contains('items', [{ item_name: itemName }])
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching purchase history:', error);
          return [];
        }
        
        // Extract the specific item details from the purchase orders
        const purchaseRecords = data?.map(po => {
          try {
            const itemsArray = typeof po.items === 'string' ? JSON.parse(po.items) : po.items;
            // Look for the item by exact match or partial match
            const itemDetails = Array.isArray(itemsArray) 
              ? itemsArray.find((item: any) => 
                  item.item_name === itemName || 
                  (item.item_name && item.item_name.includes(itemName))
                )
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
          } catch (e) {
            console.error('Error parsing purchase order items:', e);
            return null;
          }
        }).filter(Boolean) || [];
        
        return purchaseRecords;
      } catch (error) {
        console.error('Unexpected error in usePurchaseHistory:', error);
        return [];
      }
    },
    enabled: !!itemName
  });
};
