
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EngineerInventoryItem {
  id: string;
  engineerId: string;
  engineerName: string;
  itemId: string;
  itemName: string;
  assignedQuantity: number;
  remainingQuantity: number;
  modelNumber: string | null;
  modelBrand: string | null;
  lastUpdated: string;
  createdAt: string;
  warehouseSource?: string;
}

export const useEngineerInventory = () => {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['engineerInventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engineer_inventory')
        .select('*')
        .order('assigned_date', { ascending: false });
        
      if (error) throw error;
      
      console.log("Raw engineer inventory data:", data);
      
      // Transform the data to match the expected format
      const transformedData = data.map(item => ({
        id: item.id,
        engineerId: item.engineer_id,
        engineerName: item.engineer_name,
        itemId: item.item_id,
        itemName: item.item_name,
        assignedQuantity: item.quantity,
        remainingQuantity: item.quantity,
        modelNumber: item.model_number,
        modelBrand: item.model_brand,
        lastUpdated: item.assigned_date,
        createdAt: item.created_at,
        warehouseSource: item.warehouse_source
      }));
      
      console.log("Transformed engineer inventory data:", transformedData);
      
      return transformedData as EngineerInventoryItem[];
    }
  });

  return { items, isLoading, error };
};
