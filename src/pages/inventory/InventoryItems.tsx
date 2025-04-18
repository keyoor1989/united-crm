
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import UnifiedOpeningStockForm from "@/components/inventory/items/UnifiedOpeningStockForm";
import { useInventoryItems } from "@/hooks/inventory/useInventoryItems";
import InventoryTable from "@/components/inventory/InventoryTable";
import { toast } from "sonner";

const InventoryItems = () => {
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { items, isLoading } = useInventoryItems(null);

  const handleAddItem = async (formData: any) => {
    try {
      console.log("Adding new item:", formData);
      // Here you would typically save to your database
      toast.success("Item added successfully");
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
            <Button onClick={() => setOpenItemDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <InventoryTable
            searchQuery={searchQuery}
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
