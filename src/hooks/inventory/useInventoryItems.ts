
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { notifyInventoryAlert } from "@/services/telegramService";
import { InventoryItem, DbInventoryItem } from "@/types/inventory";

// Export the InventoryItem type for use in other files
export type { InventoryItem, DbInventoryItem };

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
        const lowStockItems = data.filter((item): item is NonNullable<typeof item> => 
          item !== null && 
          typeof item === 'object' && 
          'quantity' in item && 
          'min_stock' in item && 
          typeof item.quantity === 'number' && 
          typeof item.min_stock === 'number' &&
          item.quantity < item.min_stock
        );
        
        if (lowStockItems.length > 0) {
          // Only send the first low stock alert to avoid spamming
          try {
            const firstLowStockItem = lowStockItems[0];
            if (firstLowStockItem) {
              notifyInventoryAlert(firstLowStockItem as DbInventoryItem);
            }
          } catch (error) {
            console.error("Error sending alert:", error);
          }
        }
      }
      
      // Convert database items to frontend format
      // Add proper type checking to handle potential errors
      return (data || []).map((dbItem) => {
        // Skip items that might be null, error objects, or have an invalid structure
        if (!dbItem || typeof dbItem !== 'object' || 'error' in dbItem) {
          console.error("Invalid item data:", dbItem);
          return null;
        }
        
        // Use type assertion with unknown as intermediate step for safety
        try {
          return adaptInventoryItem(dbItem as DbInventoryItem);
        } catch (err) {
          console.error("Error adapting item:", dbItem, err);
          return null;
        }
      }).filter((item): item is InventoryItem => item !== null); // Type predicate to filter out null values
    },
  });

  return { items, isLoading, error };
};
