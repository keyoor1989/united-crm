
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { notifyInventoryAlert } from "@/services/telegramService";
import { InventoryItem } from "@/types/inventory";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  warehouse_id?: string;
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
    model_id: "",
    modelId: "",
    model: "",
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
    brandId: "",
    brand_id: "",
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

// A type guard to ensure we have a valid DbInventoryItem
const isValidDbInventoryItem = (item: any): item is DbInventoryItem => {
  return (
    item !== null &&
    typeof item === 'object' &&
    'id' in item &&
    typeof item.id === 'string' &&
    'part_name' in item &&
    typeof item.part_name === 'string' &&
    'category' in item &&
    typeof item.category === 'string' &&
    'quantity' in item &&
    typeof item.quantity === 'number' &&
    'min_stock' in item &&
    typeof item.min_stock === 'number' &&
    'purchase_price' in item &&
    typeof item.purchase_price === 'number'
  );
};

// Helper function to check if an item has low stock
const hasLowStock = (item: DbInventoryItem): boolean => {
  return item.quantity < item.min_stock;
};

// Helper to check if an object is an error object
const isErrorObject = (obj: any): boolean => {
  return obj !== null && typeof obj === 'object' && 'error' in obj && obj.error === true;
};

export const useInventoryItems = (warehouseId: string | null) => {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['inventory_items', warehouseId],
    queryFn: async () => {
      try {
        console.log("Fetching inventory items for warehouse:", warehouseId);
        
        let query = supabase
          .from('opening_stock_entries')
          .select('id, part_name, category, quantity, min_stock, purchase_price, brand, compatible_models, part_number, warehouse_name, warehouse_id')
          .order('part_name');
        
        if (warehouseId) {
          query = query.eq('warehouse_id', warehouseId);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }
        
        if (!data || !Array.isArray(data)) {
          console.error("Invalid data format received:", data);
          return [];
        }
        
        console.log("Raw data from Supabase:", data);
        
        // Check for low stock items and send alerts
        const lowStockItems = data.filter(item => {
          // Use our type guard to validate the item before checking stock levels
          if (!isValidDbInventoryItem(item)) {
            return false;
          }
          
          // Once we've verified it's a valid item, we can safely check stock levels
          return hasLowStock(item);
        });
        
        if (lowStockItems.length > 0) {
          // Only send the first low stock alert to avoid spamming
          try {
            const firstLowStockItem = lowStockItems[0];
            notifyInventoryAlert(firstLowStockItem);
          } catch (error) {
            console.error("Error sending alert:", error);
          }
        }
        
        // Convert database items to frontend format with careful type handling
        const adaptedItems = data
          .map(dbItem => {
            // Skip items that might be null or have an invalid structure
            if (dbItem === null) {
              console.error("Invalid item data (null)");
              return null;
            }
            
            if (typeof dbItem !== 'object') {
              console.error("Invalid item data (not an object):", dbItem);
              return null;
            }
            
            // Check if dbItem has an error property which would indicate it's an error object
            if (isErrorObject(dbItem)) {
              console.error("Error object received instead of item:", dbItem);
              return null;
            }
            
            try {
              // Use our type guard to ensure we have a valid item
              if (isValidDbInventoryItem(dbItem)) {
                return adaptInventoryItem(dbItem);
              } else {
                console.error("Item failed validation:", dbItem);
                return null;
              }
            } catch (err) {
              console.error("Error adapting item:", dbItem, err);
              return null;
            }
          })
          .filter((item): item is InventoryItem => item !== null); // Type predicate to filter out null values
          
        console.log("Adapted items:", adaptedItems);
        return adaptedItems;
      } catch (err) {
        console.error("Error in useInventoryItems query:", err);
        throw err;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { items, isLoading, error };
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('opening_stock_entries')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error deleting inventory item:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch inventory items
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      toast.success("Inventory item deleted successfully");
    },
    onError: (error) => {
      console.error('Deletion failed:', error);
      toast.error("Failed to delete inventory item");
    }
  });
};
