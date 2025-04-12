import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Warehouse, WarehouseStock } from "@/types/inventory";
import { WarehouseFormValues } from "@/components/inventory/warehouses/WarehouseForm";
import { mockWarehouseStock } from "@/components/inventory/warehouses/mockWarehouseData";
import { supabase } from "@/integrations/supabase/client";

// Fetch warehouses from Supabase
export const fetchWarehouses = async (): Promise<Warehouse[]> => {
  try {
    console.log("Fetching warehouses from Supabase...");
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error fetching warehouses from Supabase:", error);
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log("Successfully fetched warehouses from Supabase:", data);
      // Transform Supabase data to match our Warehouse type
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
    } else {
      console.log("No warehouses found in Supabase");
      return [];
    }
  } catch (error) {
    console.error("Exception fetching warehouses:", error);
    throw error;
  }
};

// Fetch warehouse stock from Supabase or mock data
export const fetchWarehouseStock = async (warehouseId: string | null): Promise<WarehouseStock[]> => {
  try {
    // Try to fetch from Supabase first
    const { data, error } = await supabase
      .from('warehouse_stock')
      .select('*')
      .eq(warehouseId ? 'warehouse_id' : '', warehouseId || '');
    
    if (error) {
      console.error("Error fetching warehouse stock from Supabase:", error);
      // Fallback to mock data if Supabase query fails
      if (warehouseId) {
        return mockWarehouseStock.filter(stock => stock.warehouseId === warehouseId);
      }
      return mockWarehouseStock;
    }
    
    if (data && data.length > 0) {
      // Transform Supabase data to match our WarehouseStock type
      return data.map(stock => ({
        id: stock.id,
        warehouseId: stock.warehouse_id,
        itemId: stock.item_id,
        quantity: stock.quantity,
        lastUpdated: stock.last_updated
      }));
    } else {
      // If no data from Supabase, use mock data
      if (warehouseId) {
        return mockWarehouseStock.filter(stock => stock.warehouseId === warehouseId);
      }
      return mockWarehouseStock;
    }
  } catch (error) {
    console.error("Exception fetching warehouse stock:", error);
    // Fallback to mock data in case of any error
    if (warehouseId) {
      return mockWarehouseStock.filter(stock => stock.warehouseId === warehouseId);
    }
    return mockWarehouseStock;
  }
};

// Create a custom hook for warehouse management
export const useWarehouses = () => {
  const queryClient = useQueryClient();

  // Fetch warehouses query with retry and refetch configuration
  const warehousesQuery = useQuery({
    queryKey: ['warehouses'],
    queryFn: fetchWarehouses,
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: 1000
  });

  // Create warehouse mutation
  const createWarehouseMutation = useMutation({
    mutationFn: async (values: WarehouseFormValues) => {
      try {
        console.log("Creating warehouse in Supabase:", values);
        
        const { data, error } = await supabase
          .from('warehouses')
          .insert({
            name: values.name,
            code: values.code,
            location: values.location,
            address: values.address,
            contact_person: values.contactPerson,
            contact_phone: values.contactPhone,
            is_active: values.isActive,
          })
          .select()
          .single();
        
        if (error) {
          console.error("Error creating warehouse in Supabase:", error);
          throw error;
        }
        
        console.log("Warehouse created successfully:", data);
        
        // Transform Supabase data to match our Warehouse type
        if (data) {
          return {
            id: data.id,
            name: data.name,
            code: data.code,
            location: data.location,
            address: data.address,
            contactPerson: data.contact_person,
            contactPhone: data.contact_phone,
            isActive: data.is_active,
            createdAt: data.created_at
          };
        }
        
        throw new Error("Failed to create warehouse");
      } catch (error) {
        console.error("Exception creating warehouse:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success("Warehouse added successfully!");
    },
    onError: (error) => {
      console.error("Error adding warehouse:", error);
      toast.error("Failed to add warehouse: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  });

  // Update warehouse mutation
  const updateWarehouseMutation = useMutation({
    mutationFn: async (values: WarehouseFormValues & { id: string }) => {
      try {
        console.log("Updating warehouse in Supabase:", values);
        
        const { data, error } = await supabase
          .from('warehouses')
          .update({
            name: values.name,
            code: values.code,
            location: values.location,
            address: values.address,
            contact_person: values.contactPerson,
            contact_phone: values.contactPhone,
            is_active: values.isActive,
          })
          .eq('id', values.id)
          .select()
          .single();
        
        if (error) {
          console.error("Error updating warehouse in Supabase:", error);
          throw error;
        }
        
        console.log("Warehouse updated successfully:", data);
        
        // Transform Supabase data to match our Warehouse type
        if (data) {
          return {
            id: data.id,
            name: data.name,
            code: data.code,
            location: data.location,
            address: data.address,
            contactPerson: data.contact_person,
            contactPhone: data.contact_phone,
            isActive: data.is_active,
            createdAt: data.created_at
          };
        }
        
        throw new Error("Failed to update warehouse");
      } catch (error) {
        console.error("Exception updating warehouse:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success("Warehouse updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating warehouse:", error);
      toast.error("Failed to update warehouse: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  });

  // Delete warehouse mutation
  const deleteWarehouseMutation = useMutation({
    mutationFn: async (warehouseId: string) => {
      try {
        console.log("Deleting warehouse from Supabase:", warehouseId);
        
        const { error } = await supabase
          .from('warehouses')
          .delete()
          .eq('id', warehouseId);
        
        if (error) {
          console.error("Error deleting warehouse from Supabase:", error);
          throw error;
        }
        
        console.log("Warehouse deleted successfully");
        return warehouseId;
      } catch (error) {
        console.error("Exception deleting warehouse:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success("Warehouse deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting warehouse:", error);
      toast.error("Failed to delete warehouse: " + (error instanceof Error ? error.message : "Unknown error"));
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
    isDeletingWarehouse: deleteWarehouseMutation.isPending,
    refetchWarehouses: warehousesQuery.refetch
  };
};

// Custom hook for warehouse stock
export const useWarehouseStock = (selectedWarehouse: string | null, activeTab: string) => {
  // Fetch warehouse stock query
  const stockQuery = useQuery({
    queryKey: ['warehouseStock', selectedWarehouse],
    queryFn: () => fetchWarehouseStock(selectedWarehouse),
    enabled: activeTab === "inventory"
  });

  return {
    stock: stockQuery.data || [],
    isLoadingStock: stockQuery.isLoading,
    stockError: stockQuery.error
  };
};
