
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CashPurchaseItemData } from "@/types/sales";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface CashPurchaseItemProps {
  item: CashPurchaseItemData;
  onUpdate: (item: CashPurchaseItemData) => void;
  onRemove: (id: string) => void;
  categories: string[];
}

export const CashPurchaseItem: React.FC<CashPurchaseItemProps> = ({
  item,
  onUpdate,
  onRemove,
  categories,
}) => {
  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...item,
      itemName: e.target.value,
    });
  };

  const handleCategoryChange = (value: string) => {
    onUpdate({
      ...item,
      category: value,
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value) || 1;
    onUpdate({
      ...item,
      quantity,
      totalAmount: quantity * item.unitPrice,
    });
  };

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const unitPrice = parseFloat(e.target.value) || 0;
    onUpdate({
      ...item,
      unitPrice,
      totalAmount: item.quantity * unitPrice,
    });
  };

  return (
    <div className="grid grid-cols-12 gap-2 border rounded-md p-2 items-center">
      <div className="col-span-3">
        <Input
          placeholder="Item name"
          value={item.itemName}
          onChange={handleItemNameChange}
        />
      </div>
      <div className="col-span-2">
        <Select value={item.category} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
        />
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={item.unitPrice}
          onChange={handleUnitPriceChange}
        />
      </div>
      <div className="col-span-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">₹{item.totalAmount.toFixed(2)}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
};
