
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Warehouse, WarehouseStock } from "@/types/inventory";
import { WarehouseFormValues } from "@/components/inventory/warehouses/WarehouseForm";

// Set up Supabase authentication for anonymous access
export const setupSupabaseAuth = async () => {
  try {
    const session = await supabase.auth.getSession();
    
    // Only sign in anonymously if there's no existing session
    if (!session.data.session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error("Error signing in anonymously:", error);
        toast.error("Authentication failed. Some features may not work properly.");
        return false;
      }
      
      console.log("Anonymous auth established");
    } else {
      console.log("Using existing auth session");
    }
    
    return true;
  } catch (err) {
    console.error("Authentication setup error:", err);
    toast.error("Failed to set up secure data access.");
    return false;
  }
};

// Fetch warehouses from Supabase
export const fetchWarehouses = async (): Promise<Warehouse[]> => {
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  // Transform the data to match our Warehouse type
  return data.map(warehouse => ({
    id: warehouse.id,
    name: warehouse.name,
    code: warehouse.code,
    location: warehouse.location,
    address: warehouse.address,
    contactPerson: warehouse.contact_person,
    contactPhone: warehouse.contact_phone,
    isActive: warehouse.is_active,
    createdAt: warehouse.created_at
  }));
};

// Fetch warehouse stock from Supabase
export const fetchWarehouseStock = async (warehouseId: string | null): Promise<WarehouseStock[]> => {
  let query = supabase
    .from('warehouse_stock')
    .select(`
      id,
      warehouse_id,
      item_id,
      quantity,
      last_updated
    `);
    
  if (warehouseId) {
    query = query.eq('warehouse_id', warehouseId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return data.map(stock => ({
    id: stock.id,
    warehouseId: stock.warehouse_id,
    itemId: stock.item_id,
    quantity: stock.quantity,
    lastUpdated: stock.last_updated
  }));
};

// Create a custom hook for warehouse management
export const useWarehouses = (authInitialized: boolean) => {
  const queryClient = useQueryClient();

  // Fetch warehouses query
  const warehousesQuery = useQuery({
    queryKey: ['warehouses'],
    queryFn: fetchWarehouses,
    enabled: authInitialized,
    retry: 2,
    staleTime: 30000 // 30 seconds
  });

  // Create warehouse mutation
  const createWarehouseMutation = useMutation({
    mutationFn: async (values: WarehouseFormValues) => {
      const { data, error } = await supabase
        .from('warehouses')
        .insert({
          name: values.name,
          code: values.code,
          location: values.location,
          address: values.address,
          contact_person: values.contactPerson,
          contact_phone: values.contactPhone,
          is_active: values.isActive
        })
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success("Warehouse added successfully!");
    },
    onError: (error) => {
      console.error("Error adding warehouse:", error);
      toast.error("Failed to add warehouse: " + error.message);
    }
  });

  // Update warehouse mutation
  const updateWarehouseMutation = useMutation({
    mutationFn: async (values: WarehouseFormValues & { id: string }) => {
      const { data, error } = await supabase
        .from('warehouses')
        .update({
          name: values.name,
          code: values.code,
          location: values.location,
          address: values.address,
          contact_person: values.contactPerson,
          contact_phone: values.contactPhone,
          is_active: values.isActive
        })
        .eq('id', values.id)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success("Warehouse updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating warehouse:", error);
      toast.error("Failed to update warehouse: " + error.message);
    }
  });

  // Delete warehouse mutation
  const deleteWarehouseMutation = useMutation({
    mutationFn: async (warehouseId: string) => {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', warehouseId);
        
      if (error) throw error;
      return warehouseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success("Warehouse deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting warehouse:", error);
      toast.error("Failed to delete warehouse: " + error.message);
    }
  });

  return {
    warehouses: warehousesQuery.data || [],
    isLoadingWarehouses: warehousesQuery.isLoading,
    warehousesError: warehousesQuery.error,
    createWarehouse: createWarehouseMutation.mutate,
    updateWarehouse: updateWarehouseMutation.mutate,
    deleteWarehouse: deleteWarehouseMutation.mutate,
    isCreatingWarehouse: createWarehouseMutation.isPending,
    isUpdatingWarehouse: updateWarehouseMutation.isPending,
    isDeletingWarehouse: deleteWarehouseMutation.isPending
  };
};

// Custom hook for warehouse stock
export const useWarehouseStock = (selectedWarehouse: string | null, activeTab: string, authInitialized: boolean) => {
  // Fetch warehouse stock query
  const stockQuery = useQuery({
    queryKey: ['warehouseStock', selectedWarehouse],
    queryFn: () => fetchWarehouseStock(selectedWarehouse),
    enabled: activeTab === "inventory" && authInitialized,
    retry: 1
  });

  return {
    stock: stockQuery.data || [],
    isLoadingStock: stockQuery.isLoading,
    stockError: stockQuery.error
  };
};
