
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePurchaseHistory = (itemName: string | null) => {
  return useQuery({
    queryKey: ['purchase_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      
      try {
        console.log('Fetching purchase history for item:', itemName);
        
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
        
        // Step 2: Get all purchase orders
        const { data: purchaseOrders, error: poError } = await supabase
          .from('purchase_orders')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (poError) {
          console.error('Error fetching purchase orders:', poError);
          return [];
        }
        
        // Step 3: Extract and format the purchase records for this specific item
        const purchaseRecords = purchaseOrders?.flatMap(po => {
          try {
            const itemsArray = typeof po.items === 'string' ? JSON.parse(po.items) : po.items;
            
            if (!Array.isArray(itemsArray)) return [];
            
            // Find relevant items in this purchase order
            const matchingItems = itemsArray.filter((item: any) => {
              // Match by item_id if available from our stock item
              if (stockItem?.id && item.item_id === stockItem.id) return true;
              
              // Or do flexible name matching
              return (
                item.itemName && (
                  item.itemName.toLowerCase().includes(itemName.toLowerCase()) ||
                  (stockItem?.part_name && item.itemName.toLowerCase().includes(stockItem.part_name.toLowerCase())) ||
                  (stockItem?.full_item_name && item.itemName.toLowerCase().includes(stockItem.full_item_name.toLowerCase()))
                )
              );
            });
            
            // Map matching items to our desired format
            return matchingItems.map((item: any) => ({
              id: `${po.id}-${item.itemName || item.item_name}`,
              date: po.created_at,
              vendor: po.vendor_name,
              quantity: item?.quantity || 0,
              rate: item?.unitPrice || item?.unit_price || 0,
              invoiceNo: po.po_number || po.invoice_number,
              remarks: po.notes || '',
              status: po.status
            }));
          } catch (e) {
            console.error('Error parsing purchase order items:', e);
            return [];
          }
        }).filter(Boolean) || [];
        
        console.log(`Found ${purchaseRecords.length} purchase records for ${itemName}`);
        
        return purchaseRecords;
      } catch (error) {
        console.error('Unexpected error in usePurchaseHistory:', error);
        return [];
      }
    },
    enabled: !!itemName
  });
};
