
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem as BaseInventoryItem } from "@/types/inventory";
import { notifyInventoryAlert } from "@/services/telegramService";

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
  brand_id?: string;
  model_id?: string;
}

// Function to convert the database schema InventoryItem to the app's BaseInventoryItem type
export const adaptInventoryItem = (item: InventoryItem): BaseInventoryItem => {
  return {
    id: item.id,
    model: item.model_id || "",
    brand: item.brand || "",
    name: item.part_name,
    category: item.category,
    minStockLevel: item.min_stock,
    currentStock: item.quantity,
    unitCost: item.purchase_price,
    lastRestocked: "",
    createdAt: new Date().toISOString(),
    
    // Additional properties used throughout the app
    modelId: item.model_id,
    brandId: item.brand_id,
    type: item.category,
    minQuantity: item.min_stock,
    currentQuantity: item.quantity,
    lastPurchasePrice: item.purchase_price,
    lastVendor: "",
    barcode: item.part_number || "",
  };
};

export const useInventoryItems = (warehouseId: string | null) => {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['inventory_items', warehouseId],
    queryFn: async () => {
      let query = supabase
        .from('opening_stock_entries')
        .select('id, part_name, category, quantity, min_stock, purchase_price, brand, compatible_models, part_number, warehouse_name')
        .order('part_name');
      
      if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Check for low stock items and send alerts
      if (data) {
        const lowStockItems = data.filter(item => item.quantity < item.min_stock);
        if (lowStockItems.length > 0) {
          // Only send the first low stock alert to avoid spamming
          if (lowStockItems.length > 0) {
            notifyInventoryAlert(lowStockItems[0]);
          }
        }
      }
      
      return data as InventoryItem[];
    },
  });

  return { items, isLoading, error };
};
