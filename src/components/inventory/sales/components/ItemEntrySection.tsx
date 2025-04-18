import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Barcode, Plus } from "lucide-react";
import { SalesInventoryItem } from "@/hooks/inventory/useSalesInventoryItems";
import { formatCurrency } from "@/utils/finance/financeUtils";
import { WarehouseStockInfo } from './WarehouseStockInfo';

interface CurrentItemType {
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  barcode: string;
}

interface ItemEntrySectionProps {
  currentItem: CurrentItemType;
  isScanning: boolean;
  inventoryItems: SalesInventoryItem[];
  isLoadingItems: boolean;
  onItemChange: (item: Partial<CurrentItemType>) => void;
  onAddItem: () => void;
  onToggleScanner: () => void;
  onBarcodeSubmit: (e: React.FormEvent) => void;
}

export const ItemEntrySection: React.FC<ItemEntrySectionProps> = ({
  currentItem,
  isScanning,
  inventoryItems,
  isLoadingItems,
  onItemChange,
  onAddItem,
  onToggleScanner,
  onBarcodeSubmit,
}) => {
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Item Details
          {isLoadingItems && " (Loading...)"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isScanning ? (
          <form onSubmit={onBarcodeSubmit} className="space-y-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Label htmlFor="barcode">Scan Barcode</Label>
                <Input
                  id="barcode"
                  ref={barcodeInputRef}
                  value={currentItem.barcode}
                  onChange={(e) => onItemChange({ barcode: e.target.value })}
                  placeholder="Scan barcode..."
                  autoComplete="off"
                />
              </div>
              <Button type="submit" size="sm">Find</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="item-name">Item Name</Label>
              <Select 
                value={currentItem.itemName} 
                onValueChange={(value) => {
                  const item = inventoryItems.find(i => 
                    i.display_name === value || i.part_name === value
                  );
                  if (item) {
                    onItemChange({
                      itemName: item.display_name || item.part_name,
                      category: item.category,
                      unitPrice: item.purchase_price * 1.3
                    });
                  }
                }}
              >
                <SelectTrigger id="item-name" className="truncate">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map((item) => (
                    <SelectItem 
                      key={item.id} 
                      value={item.display_name || item.part_name}
                      className="flex flex-col items-start"
                    >
                      <div className="truncate max-w-[300px]">
                        {item.display_name || item.part_name} ({item.quantity} in stock)
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentItem.itemName && <WarehouseStockInfo itemName={currentItem.itemName} />}
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={currentItem.category}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={currentItem.quantity}
              onChange={(e) => onItemChange({ quantity: parseInt(e.target.value) || 1 })}
            />
          </div>
          
          <div>
            <Label htmlFor="unit-price">Unit Price (₹)</Label>
            <Input
              id="unit-price"
              type="number"
              min="0"
              step="0.01"
              value={currentItem.unitPrice}
              onChange={(e) => onItemChange({ unitPrice: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onToggleScanner}
            className="flex items-center gap-1"
          >
            <Barcode className="h-4 w-4 mr-1" />
            {isScanning ? "Manual Entry" : "Scan Barcode"}
          </Button>
          
          <Button
            type="button"
            onClick={onAddItem}
            disabled={!currentItem.itemName || currentItem.unitPrice <= 0}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
        </div>
        
        <div className="text-sm text-right">
          <p>Item Total: {formatCurrency(currentItem.quantity * currentItem.unitPrice)}</p>
        </div>
      </CardContent>
    </Card>
  );
};
