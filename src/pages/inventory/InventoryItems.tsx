
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import UnifiedOpeningStockForm from "@/components/inventory/items/UnifiedOpeningStockForm";
import { useInventoryItems } from "@/hooks/inventory/useInventoryItems";
import InventoryTable from "@/components/inventory/InventoryTable";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const InventoryItems = () => {
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { items, isLoading } = useInventoryItems(null);
  const queryClient = useQueryClient();

  const handleAddItem = async (formData: any) => {
    try {
      console.log("Adding new item:", formData);
      
      // Insert the new item into the database
      const { data, error } = await supabase
        .from('opening_stock_entries')
        .insert({
          part_name: formData.partName,
          category: formData.category,
          quantity: formData.quantity,
          min_stock: formData.minStock,
          purchase_price: formData.purchasePrice,
          brand: formData.brand,
          compatible_models: formData.compatible_models || [],
          part_number: formData.partNumber,
          warehouse_id: formData.warehouse_id,
          warehouse_name: formData.warehouse_name
        })
        .select();

      if (error) {
        console.error("Error adding item:", error);
        throw error;
      }

      // Invalidate queries to refresh the inventory items list
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      
      toast.success("Item added successfully");
      setOpenItemDialog(false);
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    }
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Items & Machine Parts</h1>
          <p className="text-muted-foreground">
            Manage your inventory items and machine parts
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Items</CardTitle>
            <CardDescription>View and manage all items and parts</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items..."
                className="w-[250px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <InventoryTable
            searchQuery={searchQuery}
            onAddNew={() => setOpenItemDialog(true)}
          />
        </CardContent>
      </Card>

      <UnifiedOpeningStockForm
        open={openItemDialog}
        onOpenChange={setOpenItemDialog}
        onSubmit={handleAddItem}
      />
    </div>
  );
};

export default InventoryItems;
