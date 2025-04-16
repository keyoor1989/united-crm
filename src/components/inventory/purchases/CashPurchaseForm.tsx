
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Banknote, Save } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { CashPurchaseItem } from "./CashPurchaseItem";
import { CashPurchaseItemData } from "@/types/sales";

interface CashPurchaseFormProps {
  onSave: (items: CashPurchaseItemData[], vendorName: string, notes: string) => void;
  categories: string[];
}

export const CashPurchaseForm: React.FC<CashPurchaseFormProps> = ({
  onSave,
  categories,
}) => {
  const [items, setItems] = useState<CashPurchaseItemData[]>([]);
  const [vendorName, setVendorName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const addNewItem = () => {
    const newItem: CashPurchaseItemData = {
      id: uuidv4(),
      itemName: "",
      category: categories[0] || "Other",
      description: "",
      quantity: 1,
      unitPrice: 0,
      totalAmount: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (updatedItem: CashPurchaseItemData) => {
    setItems(
      items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalAmount, 0);
  };

  const handleSubmit = () => {
    // Validate items
    const emptyItems = items.filter(item => !item.itemName || item.unitPrice <= 0);
    if (emptyItems.length > 0) {
      toast.error("Please fill in all item details");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    onSave(items, vendorName, notes);
    
    // Reset form
    setItems([]);
    setVendorName("");
    setNotes("");
    
    toast.success("Cash purchase recorded successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium mb-1">Vendor/Shop Name</label>
          <Input
            placeholder="Enter vendor or shop name"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Purchase Items</h3>
          <Button onClick={addNewItem} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
        
        {items.length > 0 ? (
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-2 text-sm font-medium px-3 py-2">
              <div className="col-span-3">Item Name</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-1"></div>
            </div>
            
            {items.map((item) => (
              <CashPurchaseItem
                key={item.id}
                item={item}
                onUpdate={updateItem}
                onRemove={removeItem}
                categories={categories}
              />
            ))}
            
            <div className="flex justify-end mt-4">
              <div className="text-xl font-bold">
                Total: ₹{calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border rounded-md bg-gray-50">
            <Banknote className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No items added yet. Click "Add Item" to start.</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <Input
          placeholder="Enter optional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSubmit} className="gap-2">
          <Save className="h-4 w-4" />
          Save Cash Purchase
        </Button>
      </div>
    </div>
  );
};
