
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types"; // Import the Json type from supabase

export interface SalesInventoryItem {
  id: string;
  part_name: string;
  category: string;
  quantity: number;
  purchase_price: number;
  brand?: string;
  part_number?: string;
  compatible_models?: string[];
  display_name?: string; // New field for display purposes
}

export const useSalesInventoryItems = () => {
  return useQuery({
    queryKey: ['sales_inventory_items'],
    queryFn: async () => {
      console.log("Fetching inventory items for sales");
      const { data, error } = await supabase
        .from('opening_stock_entries')
        .select('*')
        .order('part_name');

      if (error) {
        console.error('Error fetching inventory items:', error);
        toast.error('Failed to load inventory items');
        return [];
      }

      console.log("Raw data from Supabase:", data);

      // Map database items to SalesInventoryItem interface
      const adaptedItems = data.map((item): SalesInventoryItem => {
        // Handle compatible_models safely, ensuring it's always an array
        let compatibleModels: string[] = [];
        
        // Check if compatible_models exists and convert it to an array if needed
        if (item.compatible_models) {
          // If it's already a string array, use it directly
          if (Array.isArray(item.compatible_models)) {
            compatibleModels = item.compatible_models.map(model => 
              typeof model === 'string' ? model : String(model)
            );
          } 
          // If it's a JSON object from the database, parse it safely
          else {
            try {
              const parsed = typeof item.compatible_models === 'string' 
                ? JSON.parse(item.compatible_models) 
                : item.compatible_models;
                
              if (Array.isArray(parsed)) {
                compatibleModels = parsed.map(model => 
                  typeof model === 'string' ? model : String(model)
                );
              }
            } catch (e) {
              console.error("Error parsing compatible_models:", e);
              compatibleModels = [];
            }
          }
        }
        
        // Create a display name that includes brand and model information
        let modelInfo = '';
        if (compatibleModels.length > 0) {
          modelInfo = compatibleModels.slice(0, 2).join(', ');
          if (compatibleModels.length > 2) {
            modelInfo += '...';
          }
        }
        
        const displayName = [
          item.part_name,
          item.brand ? `(${item.brand}` : '',
          modelInfo ? ` - ${modelInfo})` : item.brand ? ')' : ''
        ].filter(Boolean).join(' ');

        return {
          id: item.id,
          part_name: item.part_name,
          category: item.category,
          quantity: item.quantity,
          purchase_price: item.purchase_price,
          brand: item.brand,
          part_number: item.part_number,
          compatible_models: compatibleModels,
          display_name: displayName
        };
      });

      console.log("Adapted items:", adaptedItems);
      return adaptedItems;
    },
    refetchInterval: 30000, // Refresh data every 30 seconds
    refetchOnWindowFocus: true, // Refresh when window gets focus
    refetchOnMount: true, // Refresh when component mounts
  });
};
