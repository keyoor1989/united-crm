
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { InventoryItem } from "@/types/inventory";
import { useInventoryItems, useDeleteInventoryItem } from "@/hooks/inventory/useInventoryItems";
import OpeningStockEntryForm from "@/components/inventory/OpeningStockEntryForm";
import ItemHistoryDialog from "@/components/inventory/ItemHistoryDialog";

// Import new components
import PartsHeader from "@/components/inventory/machine-parts/PartsHeader";
import InventoryTabs from "@/components/inventory/machine-parts/InventoryTabs";

const MachineParts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  const queryClient = useQueryClient();
  const { items, isLoading, error } = useInventoryItems(null);
  const deleteItemMutation = useDeleteInventoryItem();

  const handleAddItem = (newPart: any) => {
    console.log("New part added:", newPart);
    // Invalidate the query to refresh the items list
    queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
    setIsAddDialogOpen(false);
    toast.success("Part added successfully");
  };

  const openDeleteDialog = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteItem = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate(itemToDelete.id);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openHistoryDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsHistoryDialogOpen(true);
  };

  // For debugging
  useEffect(() => {
    console.log("Current items in list:", items);
  }, [items]);

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.model && item.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.part_number && item.part_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesBrand = selectedBrand === "all" || item.brand === selectedBrand;
    
    if (activeTab === "low_stock") {
      return matchesSearch && matchesCategory && matchesBrand && item.currentStock < item.minStockLevel;
    }
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const categories = Array.from(new Set(items.map(item => item.category)));
  const brands = Array.from(new Set(items.map(item => item.brand)));

  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Machine Parts Catalogue</title>
      </Helmet>

      <PartsHeader onAddPart={() => setIsAddDialogOpen(true)} />

      <InventoryTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        categories={categories}
        brands={brands}
        filteredItems={filteredItems}
        isLoading={isLoading}
        error={error}
        onDeleteItem={openDeleteDialog}
        onViewHistory={openHistoryDialog}
      />

      <OpeningStockEntryForm
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddPart={handleAddItem}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {itemToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ItemHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        item={selectedItem}
      />
    </div>
  );
};

export default MachineParts;
