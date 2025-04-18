
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SalesInventoryItem {
  id: string;
  part_name: string;
  category: string;
  quantity: number;
  purchase_price: number;
  brand?: string;
  part_number?: string;
}

export const useSalesInventoryItems = () => {
  return useQuery({
    queryKey: ['sales_inventory_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opening_stock_entries')
        .select('*')
        .order('part_name');

      if (error) {
        console.error('Error fetching inventory items:', error);
        toast.error('Failed to load inventory items');
        return [];
      }

      // Map database items to SalesInventoryItem interface
      return data.map((item): SalesInventoryItem => ({
        id: item.id,
        part_name: item.part_name,
        category: item.category,
        quantity: item.quantity,
        purchase_price: item.purchase_price,
        brand: item.brand,
        part_number: item.part_number
      }));
    }
  });
};
