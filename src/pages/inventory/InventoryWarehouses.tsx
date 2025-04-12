
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus } from "lucide-react";
import { toast } from "sonner";
import { Warehouse } from "@/types/inventory";
import { WarehouseFormValues } from "@/components/inventory/warehouses/WarehouseForm";
import { useWarehouses, useWarehouseStock } from "@/hooks/warehouses/useWarehouses";
import WarehouseTable from "@/components/inventory/warehouses/WarehouseTable";
import StockTable from "@/components/inventory/warehouses/StockTable";
import WarehouseSelector from "@/components/inventory/warehouses/WarehouseSelector";
import DeleteConfirmDialog from "@/components/inventory/warehouses/DeleteConfirmDialog";
import WarehouseFormDialog from "@/components/inventory/warehouses/WarehouseFormDialog";

const InventoryWarehouses = () => {
  const [activeTab, setActiveTab] = useState("warehouses");
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Use custom hooks with mock data
  const {
    warehouses,
    isLoadingWarehouses,
    warehousesError,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    isCreatingWarehouse,
    isUpdatingWarehouse,
    isDeletingWarehouse
  } = useWarehouses();

  const {
    stock,
    isLoadingStock
  } = useWarehouseStock(selectedWarehouse, activeTab);

  // Filter warehouses based on search
  const filteredWarehouses = warehouses.filter(warehouse =>
    searchQuery
      ? warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warehouse.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warehouse.location.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // Create a mapping of warehouse IDs to names for the stock table
  const warehouseNames = warehouses.reduce((acc, warehouse) => {
    acc[warehouse.id] = warehouse.name;
    return acc;
  }, {} as Record<string, string>);

  // Handle form submission
  const handleSubmit = (values: WarehouseFormValues) => {
    if (editingWarehouse) {
      updateWarehouse({
        ...values,
        id: editingWarehouse.id
      });
    } else {
      createWarehouse(values);
    }
    setOpenAddDialog(false);
  };

  // Handle edit warehouse
  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setOpenAddDialog(true);
  };

  // Handle delete warehouse
  const handleDeleteWarehouse = (warehouseId: string) => {
    // Find the warehouse to get its name for the confirmation dialog
    const warehouse = warehouses.find(w => w.id === warehouseId);
    setDeleteConfirmId(warehouseId);
  };

  // Confirm delete warehouse
  const confirmDeleteWarehouse = () => {
    if (deleteConfirmId) {
      deleteWarehouse(deleteConfirmId);
      
      // If we're viewing stock for the deleted warehouse, reset selection
      if (selectedWarehouse === deleteConfirmId) {
        setSelectedWarehouse(null);
      }
    }
  };

  // Handle errors with toast notifications
  React.useEffect(() => {
    if (warehousesError) {
      toast.error(`Error loading warehouses: ${warehousesError.message}`);
    }
  }, [warehousesError]);

  // Get the name of the warehouse being deleted (for the confirmation dialog)
  const warehouseToDelete = deleteConfirmId 
    ? warehouses.find(w => w.id === deleteConfirmId)?.name 
    : undefined;
  
  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Warehouse Management</h1>
          <p className="text-muted-foreground">
            Manage warehouses and track inventory across locations
          </p>
        </div>
        <Button onClick={() => {
          setEditingWarehouse(null);
          setOpenAddDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Warehouse
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search warehouses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="inventory">Warehouse Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Locations</CardTitle>
              <CardDescription>
                Manage your warehouse facilities and storage locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WarehouseTable 
                warehouses={filteredWarehouses}
                isLoading={isLoadingWarehouses}
                onEdit={handleEditWarehouse}
                onDelete={handleDeleteWarehouse}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Inventory</CardTitle>
              <CardDescription>
                View inventory levels across all warehouses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WarehouseSelector 
                warehouses={warehouses}
                selectedWarehouse={selectedWarehouse}
                onSelectWarehouse={setSelectedWarehouse}
                isLoading={isLoadingWarehouses}
              />

              <StockTable 
                stock={stock}
                isLoading={isLoadingStock}
                warehouseNames={warehouseNames}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Warehouse Dialog */}
      <WarehouseFormDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        editingWarehouse={editingWarehouse}
        onSubmit={handleSubmit}
        isSubmitting={isCreatingWarehouse || isUpdatingWarehouse}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        onConfirm={confirmDeleteWarehouse}
        isDeleting={isDeletingWarehouse}
        warehouseName={warehouseToDelete}
      />
    </div>
  );
};

export default InventoryWarehouses;
