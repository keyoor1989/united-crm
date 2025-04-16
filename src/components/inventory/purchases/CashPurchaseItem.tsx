
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CashPurchaseItemData } from "@/types/sales";

interface CashPurchaseItemProps {
  item: CashPurchaseItemData;
  onUpdate: (updatedItem: CashPurchaseItemData) => void;
  onRemove: (id: string) => void;
  categories: string[];
}

export const CashPurchaseItem: React.FC<CashPurchaseItemProps> = ({
  item,
  onUpdate,
  onRemove,
  categories,
}) => {
  const [localItem, setLocalItem] = useState<CashPurchaseItemData>(item);

  const handleInputChange = (field: keyof CashPurchaseItemData, value: any) => {
    const updatedItem = { ...localItem, [field]: value };
    
    // Recalculate total if quantity or price changes
    if (field === "quantity" || field === "unitPrice") {
      const quantity = field === "quantity" ? Number(value) : localItem.quantity;
      const price = field === "unitPrice" ? Number(value) : localItem.unitPrice;
      updatedItem.totalAmount = quantity * price;
    }
    
    setLocalItem(updatedItem);
    onUpdate(updatedItem);
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-md border mb-2">
      <div className="flex-1 grid grid-cols-12 gap-2 items-center">
        <div className="col-span-3">
          <Input
            placeholder="Item name"
            value={localItem.itemName}
            onChange={(e) => handleInputChange("itemName", e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="col-span-2">
          <Select
            value={localItem.category}
            onValueChange={(value) => handleInputChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="col-span-2">
          <Input
            placeholder="Quantity"
            type="number"
            min="1"
            value={localItem.quantity}
            onChange={(e) => handleInputChange("quantity", Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="col-span-2">
          <Input
            placeholder="Price"
            type="number"
            min="0"
            step="0.01"
            value={localItem.unitPrice}
            onChange={(e) => handleInputChange("unitPrice", Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="col-span-2">
          <div className="font-medium">₹{localItem.totalAmount.toFixed(2)}</div>
        </div>
        
        <div className="col-span-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item.id)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
