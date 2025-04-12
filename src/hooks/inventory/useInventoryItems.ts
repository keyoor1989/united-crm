
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem as BaseInventoryItem } from "@/types/inventory";

// Define the database schema representation of inventory items
export interface InventoryItem {
  id: string;
  part_name: string;
  category: string;
  quantity: number;
  min_stock: number;
  purchase_price: number;
  brand?: string;
  compatible_models?: string[];
  part_number?: string;
  brandId?: string;
  modelId?: string;
}

// Function to convert the database schema InventoryItem to the app's BaseInventoryItem type
export const adaptInventoryItem = (item: InventoryItem): BaseInventoryItem => {
  return {
    id: item.id,
    modelId: item.modelId || "",
    brandId: item.brandId || item.brand || "",
    name: item.part_name,
    type: item.category as any,
    minQuantity: item.min_stock,
    currentQuantity: item.quantity,
    lastPurchasePrice: item.purchase_price,
    lastVendor: "",
    barcode: item.part_number || "",
    createdAt: new Date().toISOString()
  };
};

export const useInventoryItems = (warehouseId: string | null) => {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['inventory_items', warehouseId],
    queryFn: async () => {
      let query = supabase
        .from('opening_stock_entries')
        .select('id, part_name, category, quantity, min_stock, purchase_price, brand, compatible_models, part_number')
        .order('part_name');
      
      if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as InventoryItem[];
    },
  });

  return { items, isLoading, error };
};
