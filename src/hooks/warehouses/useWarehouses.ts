
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Warehouse, WarehouseStock } from "@/types/inventory";
import { WarehouseFormValues } from "@/components/inventory/warehouses/WarehouseForm";
import { mockWarehouses, mockWarehouseStock } from "@/components/inventory/warehouses/mockWarehouseData";

// Mock function to fetch warehouses
export const fetchWarehouses = async (): Promise<Warehouse[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockWarehouses;
};

// Mock function to fetch warehouse stock
export const fetchWarehouseStock = async (warehouseId: string | null): Promise<WarehouseStock[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Filter stock by warehouse if warehouseId is provided
  if (warehouseId) {
    return mockWarehouseStock.filter(stock => stock.warehouseId === warehouseId);
  }
  
  return mockWarehouseStock;
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new warehouse with a unique ID
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find and update the warehouse
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the warehouse index
      const index = mockWarehouses.findIndex(w => w.id === warehouseId);
      
      if (index === -1) {
        throw new Error("Warehouse not found");
      }
      
      // In a real app, this would be an API call
      mockWarehouses.splice(index, 1);
      
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
