
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Scan, Package } from "lucide-react";
import { toast } from "sonner";
import { Brand, Model, InventoryItem } from "@/types/inventory";

interface ItemSelectorProps {
  brands: Brand[];
  models: Model[];
  items: InventoryItem[];
  onItemSelect: (item: InventoryItem) => void;
  showBarcodeScan?: boolean;
  showQuantityInSelector?: boolean;
}

const ItemSelector = ({
  brands,
  models,
  items,
  onItemSelect,
  showBarcodeScan = true,
  showQuantityInSelector = true
}: ItemSelectorProps) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  
  // Filter to only include valid brands with non-empty IDs
  const validBrands = brands.filter(brand => !!brand.id);
  
  // Reset model selection when brand changes
  useEffect(() => {
    setSelectedModelId("");
    setSelectedItemId("");
  }, [selectedBrandId]);
  
  // Reset item selection when model changes
  useEffect(() => {
    setSelectedItemId("");
  }, [selectedModelId]);
  
  // Filter models based on selected brand
  const filteredModels = models.filter(
    model => selectedBrandId && model.brandId === selectedBrandId
  );
  
  // Filter items based on selected model
  const filteredItems = items.filter(
    item => selectedModelId && item.modelId === selectedModelId
  );
  
  // Handle barcode scan
  const handleBarcodeScan = () => {
    if (!barcodeInput) {
      toast.warning("Please enter a barcode to scan");
      return;
    }
    
    // Find the item by barcode
    const item = items.find(item => item.barcode === barcodeInput);
    
    if (item) {
      // Find the model and brand for this item
      const model = models.find(model => model.id === item.modelId);
      const brand = brands.find(brand => brand.id === item.brandId);
      
      if (model && brand) {
        setSelectedBrandId(brand.id);
        setSelectedModelId(model.id);
        setSelectedItemId(item.id);
        onItemSelect(item);
        toast.success(`Item ${item.name} found and selected`);
      }
    } else {
      toast.error(`No item found with barcode ${barcodeInput}`);
    }
    
    setBarcodeInput("");
  };
  
  // Handle direct item selection
  const handleItemChange = (value: string) => {
    setSelectedItemId(value);
    const item = items.find(item => item.id === value);
    if (item) {
      onItemSelect(item);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Brand, Model, Item Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand-select">Brand</Label>
          <Select 
            value={selectedBrandId} 
            onValueChange={setSelectedBrandId}
          >
            <SelectTrigger id="brand-select">
              <SelectValue placeholder="Select Brand" />
            </SelectTrigger>
            <SelectContent>
              {validBrands.length > 0 ? (
                validBrands.map(brand => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name || 'Unnamed Brand'}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no_brands" disabled>No brands available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="model-select">Model</Label>
          <Select 
            value={selectedModelId} 
            onValueChange={setSelectedModelId}
            disabled={!selectedBrandId}
          >
            <SelectTrigger id="model-select">
              <SelectValue placeholder={selectedBrandId ? "Select Model" : "Select Brand first"} />
            </SelectTrigger>
            <SelectContent>
              {filteredModels.length > 0 ? (
                filteredModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name || 'Unnamed Model'}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no_models" disabled>
                  {selectedBrandId ? "No models available for this brand" : "Select a brand first"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="item-select">Item</Label>
          <Select 
            value={selectedItemId} 
            onValueChange={handleItemChange}
            disabled={!selectedModelId}
          >
            <SelectTrigger id="item-select">
              <SelectValue placeholder={selectedModelId ? "Select Item" : "Select Model first"} />
            </SelectTrigger>
            <SelectContent>
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    <div className="flex justify-between w-full items-center">
                      <span>{item.name || 'Unnamed Item'}</span>
                      {showQuantityInSelector && (
                        <Badge variant={item.currentQuantity < item.minQuantity ? "destructive" : "outline"}>
                          {item.currentQuantity} in stock
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no_items" disabled>
                  {selectedModelId ? "No items available for this model" : "Select a model first"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Barcode Scanner */}
      {showBarcodeScan && (
        <div className="pt-2">
          <Label htmlFor="barcode-scan">Scan Barcode</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="barcode-scan"
              placeholder="Enter or scan barcode"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
            />
            <Button type="button" onClick={handleBarcodeScan} variant="outline">
              <Scan size={16} className="mr-2" />
              Scan
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            If barcode scanner is not available, you can use the selection above.
          </p>
        </div>
      )}
    </div>
  );
};

export default ItemSelector;
