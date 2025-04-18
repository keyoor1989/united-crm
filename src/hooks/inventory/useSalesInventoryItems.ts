
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
  compatible_models?: string[];
  display_name?: string; // New field for display purposes
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
      return data.map((item): SalesInventoryItem => {
        // Handle compatible_models safely, ensuring it's always an array
        let compatibleModels: string[] = [];
        
        // Check if compatible_models exists and convert it to an array if needed
        if (item.compatible_models) {
          // If it's already an array, use it directly
          if (Array.isArray(item.compatible_models)) {
            compatibleModels = item.compatible_models;
          } 
          // If it's a string (could happen with JSON conversion), try to parse it
          else if (typeof item.compatible_models === 'string') {
            try {
              const parsed = JSON.parse(item.compatible_models);
              compatibleModels = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              // If parsing fails, use empty array
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
    }
  });
};
