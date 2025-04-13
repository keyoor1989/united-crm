
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { notifyInventoryAlert } from "@/services/telegramService";
import { InventoryItem } from "@/types/inventory";

// Database object type that matches the actual database schema
export interface DbInventoryItem {
  id: string;
  part_name: string;
  category: string;
  quantity: number;
  min_stock: number;
  purchase_price: number;
  brand?: string;
  compatible_models?: string[];
  part_number?: string;
  warehouse_name?: string;
  brand_id?: string;
  model_id?: string;
}

// Export the InventoryItem type for use in other files
export type { InventoryItem };

// Function to convert the database schema InventoryItem to the app's InventoryItem type
export const adaptInventoryItem = (item: DbInventoryItem): InventoryItem => {
  return {
    id: item.id,
    part_name: item.part_name,
    name: item.part_name,
    category: item.category,
    quantity: item.quantity,
    min_stock: item.min_stock,
    purchase_price: item.purchase_price,
    brand: item.brand || "",
    model_id: item.model_id || "",
    modelId: item.model_id || "",
    model: item.model_id || "",
    currentStock: item.quantity,
    minStockLevel: item.min_stock,
    maxStockLevel: 100, // Default value 
    reorderPoint: Math.floor(item.min_stock * 0.8), // Default calculation
    unitCost: item.purchase_price,
    unitPrice: item.purchase_price * 1.3, // Default markup
    location: "",
    lastRestocked: "",
    createdAt: new Date().toISOString(),
    
    // Additional properties
    brandId: item.brand_id,
    brand_id: item.brand_id,
    type: item.category,
    minQuantity: item.min_stock,
    currentQuantity: item.quantity,
    lastPurchasePrice: item.purchase_price,
    lastVendor: "",
    barcode: item.part_number || "",
    part_number: item.part_number,
    compatible_models: item.compatible_models,
  };
};

export const useInventoryItems = (warehouseId: string | null) => {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['inventory_items', warehouseId],
    queryFn: async () => {
      let query = supabase
        .from('opening_stock_entries')
        .select('id, part_name, category, quantity, min_stock, purchase_price, brand, compatible_models, part_number, warehouse_name, brand_id, model_id')
        .order('part_name');
      
      if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Check for low stock items and send alerts
      if (data && data.length > 0) {
        // Safely check for low stock items with type checking
        const lowStockItems = data.filter((item) => {
          if (!item) return false;
          
          return (
            typeof item === 'object' && 
            'quantity' in item && 
            'min_stock' in item && 
            typeof item.quantity === 'number' && 
            typeof item.min_stock === 'number' &&
            item.quantity < item.min_stock
          );
        });
        
        if (lowStockItems.length > 0 && lowStockItems[0]) {
          // Only send the first low stock alert to avoid spamming
          try {
            const firstLowStockItem = lowStockItems[0];
            // Explicitly validate the item before passing it to the notification function
            if (
              firstLowStockItem && 
              typeof firstLowStockItem.id === 'string' &&
              typeof firstLowStockItem.part_name === 'string'
            ) {
              notifyInventoryAlert(firstLowStockItem as DbInventoryItem);
            }
          } catch (error) {
            console.error("Error sending alert:", error);
          }
        }
      }
      
      // Convert database items to frontend format with careful type handling
      return (data || [])
        .map((dbItem) => {
          // Skip items that might be null, error objects, or have an invalid structure
          if (!dbItem) {
            console.error("Invalid item data (null)");
            return null;
          }
          
          if (typeof dbItem !== 'object') {
            console.error("Invalid item data (not an object):", dbItem);
            return null;
          }
          
          if ('error' in dbItem) {
            console.error("Error object received instead of item:", dbItem);
            return null;
          }
          
          // Use type assertion with safety checks
          try {
            // Make sure required fields exist before adapting
            if (
              'id' in dbItem &&
              'part_name' in dbItem &&
              'category' in dbItem &&
              'quantity' in dbItem &&
              'min_stock' in dbItem &&
              'purchase_price' in dbItem
            ) {
              const safeDbItem = dbItem as DbInventoryItem;
              return adaptInventoryItem(safeDbItem);
            } else {
              console.error("Item missing required fields:", dbItem);
              return null;
            }
          } catch (err) {
            console.error("Error adapting item:", dbItem, err);
            return null;
          }
        })
        .filter((item): item is InventoryItem => item !== null); // Type predicate to filter out null values
    },
  });

  return { items, isLoading, error };
};
