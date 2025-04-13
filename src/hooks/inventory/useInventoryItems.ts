
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { notifyInventoryAlert } from "@/services/telegramService";

// Define the database schema representation of inventory items
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
  brand_id?: string;
  model_id?: string;
  warehouse_name?: string;
}

// Extended InventoryItem with properly named fields for frontend use
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
  
  // Frontend properties used in the application
  name: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  unitCost: number;
  unitPrice: number;
  location: string;
  lastRestocked: string;
  createdAt: string;
  
  // Additional properties
  brandId?: string;
  modelId?: string;
  type?: string;
  minQuantity?: number;
  currentQuantity?: number;
  lastPurchasePrice?: number;
  lastVendor?: string;
  barcode?: string;
}

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
    modelId: item.model_id,
    type: item.category,
    minQuantity: item.min_stock,
    currentQuantity: item.quantity,
    lastPurchasePrice: item.purchase_price,
    lastVendor: "",
    barcode: item.part_number || "",
    part_number: item.part_number,
    compatible_models: item.compatible_models,
    brand_id: item.brand_id,
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
      if (data) {
        const lowStockItems = data.filter(item => item.quantity < item.min_stock);
        if (lowStockItems.length > 0) {
          // Only send the first low stock alert to avoid spamming
          if (lowStockItems.length > 0) {
            notifyInventoryAlert(lowStockItems[0]);
          }
        }
      }
      
      // Convert database items to frontend format
      // Cast to handle type compatibility with the database schema
      return data.map((item) => adaptInventoryItem(item as DbInventoryItem));
    },
  });

  return { items, isLoading, error };
};
