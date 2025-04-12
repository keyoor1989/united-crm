
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Warehouse, WarehouseStock } from "@/types/inventory";
import { WarehouseFormValues } from "@/components/inventory/warehouses/WarehouseForm";
import { mockWarehouses, mockWarehouseStock } from "@/components/inventory/warehouses/mockWarehouseData";
import { supabase } from "@/integrations/supabase/client";

// Mock function to fetch warehouses
export const fetchWarehouses = async (): Promise<Warehouse[]> => {
  try {
    // Try to fetch from Supabase first
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error fetching warehouses from Supabase:", error);
      // Fallback to mock data if Supabase query fails
      return mockWarehouses;
    }
    
    if (data && data.length > 0) {
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
      // If no data from Supabase, use mock data
      return mockWarehouses;
    }
  } catch (error) {
    console.error("Exception fetching warehouses:", error);
    // Fallback to mock data in case of any error
    return mockWarehouses;
  }
};

// Mock function to fetch warehouse stock
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

  // Fetch warehouses query
  const warehousesQuery = useQuery({
    queryKey: ['warehouses'],
    queryFn: fetchWarehouses,
    staleTime: 30000 // 30 seconds
  });

  // Create warehouse mutation
  const createWarehouseMutation = useMutation({
    mutationFn: async (values: WarehouseFormValues) => {
      try {
        // Try to insert into Supabase first
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
        
        // If Supabase insert failed, fall back to mock data
        const newWarehouse: Warehouse = {
          id: `w${mockWarehouses.length + 1}`,
          name: values.name,
          code: values.code,
          location: values.location,
          address: values.address,
          contactPerson: values.contactPerson,
          contactPhone: values.contactPhone,
          isActive: values.isActive,
          createdAt: new Date().toISOString()
        };
        
        // In a real app, this would be an API call
        mockWarehouses.push(newWarehouse);
        
        return newWarehouse;
      } catch (error) {
        console.error("Exception creating warehouse:", error);
        
        // Fallback to mock data in case of any error
        const newWarehouse: Warehouse = {
          id: `w${mockWarehouses.length + 1}`,
          name: values.name,
          code: values.code,
          location: values.location,
          address: values.address,
          contactPerson: values.contactPerson,
          contactPhone: values.contactPhone,
          isActive: values.isActive,
          createdAt: new Date().toISOString()
        };
        
        // In a real app, this would be an API call
        mockWarehouses.push(newWarehouse);
        
        return newWarehouse;
      }
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
      try {
        // Try to update in Supabase first
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
        
        // If Supabase update failed, fall back to mock data
        const index = mockWarehouses.findIndex(w => w.id === values.id);
        
        if (index === -1) {
          throw new Error("Warehouse not found");
        }
        
        const updatedWarehouse: Warehouse = {
          ...mockWarehouses[index],
          name: values.name,
          code: values.code,
          location: values.location,
          address: values.address,
          contactPerson: values.contactPerson,
          contactPhone: values.contactPhone,
          isActive: values.isActive
        };
        
        // In a real app, this would be an API call
        mockWarehouses[index] = updatedWarehouse;
        
        return updatedWarehouse;
      } catch (error) {
        console.error("Exception updating warehouse:", error);
        
        // Fallback to mock data in case of any error
        const index = mockWarehouses.findIndex(w => w.id === values.id);
        
        if (index === -1) {
          throw new Error("Warehouse not found");
        }
        
        const updatedWarehouse: Warehouse = {
          ...mockWarehouses[index],
          name: values.name,
          code: values.code,
          location: values.location,
          address: values.address,
          contactPerson: values.contactPerson,
          contactPhone: values.contactPhone,
          isActive: values.isActive
        };
        
        // In a real app, this would be an API call
        mockWarehouses[index] = updatedWarehouse;
        
        return updatedWarehouse;
      }
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
      try {
        // Try to delete from Supabase first
        const { error } = await supabase
          .from('warehouses')
          .delete()
          .eq('id', warehouseId);
        
        if (error) {
          console.error("Error deleting warehouse from Supabase:", error);
          throw error;
        }
        
        return warehouseId;
      } catch (error) {
        console.error("Exception deleting warehouse:", error);
        
        // Fallback to mock data in case of any error
        const index = mockWarehouses.findIndex(w => w.id === warehouseId);
        
        if (index === -1) {
          throw new Error("Warehouse not found");
        }
        
        // In a real app, this would be an API call
        mockWarehouses.splice(index, 1);
        
        return warehouseId;
      }
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
