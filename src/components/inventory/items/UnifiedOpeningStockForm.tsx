
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Brand, Model, dbAdapter } from "@/types/inventory";

interface UnifiedOpeningStockFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const UnifiedOpeningStockForm: React.FC<UnifiedOpeningStockFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    partName: "",
    category: "Spare Part",
    brand: "",
    modelCompatibility: [] as string[],
    partNumber: "",
    quantity: 0,
    minStock: 0,
    purchasePrice: 0,
    warehouseId: "",
  });

  // Fetch brands
  const { data: brands = [], isLoading: isLoadingBrands } = useQuery({
    queryKey: ['inventory-brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_brands')
        .select('*')
        .order('name');
      
      if (error) throw error;
      // Use the adapter to convert from DB format to our TypeScript interface format
      return (data || []).map(brand => dbAdapter.adaptBrand(brand));
    }
  });

  // Fetch models based on selected brand
  const { data: models = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ['inventory-models', formData.brand],
    queryFn: async () => {
      if (!formData.brand) return [];
      
      const { data, error } = await supabase
        .from('inventory_models')
        .select('*')
        .eq('brand_id', formData.brand)
        .order('name');
      
      if (error) throw error;
      // Use the adapter to convert from DB format to our TypeScript interface format
      return (data || []).map(model => dbAdapter.adaptModel(model));
    },
    enabled: !!formData.brand
  });

  // Fetch warehouses
  const { data: warehouses = [], isLoading: isLoadingWarehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.partName || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.warehouseId) {
      toast.error("Please select a warehouse");
      return;
    }

    // Find the brand name from the selected brand ID
    const selectedBrand = brands.find(b => b.id === formData.brand);
    
    // Find the warehouse name from the selected warehouse ID
    const selectedWarehouse = warehouses.find(w => w.id === formData.warehouseId);
    
    const submissionData = {
      ...formData,
      brand: selectedBrand?.name || formData.brand,
      compatible_models: formData.modelCompatibility,
      warehouse_id: formData.warehouseId,
      warehouse_name: selectedWarehouse?.name || "",
    };

    onSubmit(submissionData);
    setFormData({
      partName: "",
      category: "Spare Part",
      brand: "",
      modelCompatibility: [],
      partNumber: "",
      quantity: 0,
      minStock: 0,
      purchasePrice: 0,
      warehouseId: "",
    });
    onOpenChange(false);
  };

  const handleModelToggle = (modelName: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      modelCompatibility: checked 
        ? [...prev.modelCompatibility, modelName]
        : prev.modelCompatibility.filter(m => m !== modelName)
    }));
  };

  const categories = [
    "Spare Part",
    "Toner",
    "Drum",
    "Developer",
    "Machine Part",
    "Consumable"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Item/Part</DialogTitle>
            <DialogDescription>
              Enter the details for the new inventory item or machine part
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="partName">Item/Part Name *</Label>
              <Input
                id="partName"
                value={formData.partName}
                onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                placeholder="Enter item or part name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Select
                value={formData.brand}
                onValueChange={(value) => {
                  setFormData({ ...formData, brand: value, modelCompatibility: [] });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingBrands ? (
                    <SelectItem value="loading" disabled>Loading brands...</SelectItem>
                  ) : brands.length > 0 ? (
                    brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-brands" disabled>No brands available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Compatible Models</Label>
              <div className="border rounded-md">
                <ScrollArea className="h-[100px] p-2">
                  {isLoadingModels ? (
                    <div className="p-2 text-sm text-muted-foreground">Loading models...</div>
                  ) : models.length > 0 ? (
                    <div className="space-y-2">
                      {models.map((model) => (
                        <div key={model.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`model-${model.id}`}
                            checked={formData.modelCompatibility.includes(model.name)}
                            onCheckedChange={(checked) => 
                              handleModelToggle(model.name, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={`model-${model.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {model.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      {formData.brand ? "No models available for this brand" : "Select a brand first"}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partNumber">Part Number</Label>
              <Input
                id="partNumber"
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                placeholder="Enter part number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Opening Stock *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Minimum Stock Level *</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price *</Label>
              <Input
                id="purchasePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouse">Warehouse *</Label>
              <Select
                value={formData.warehouseId}
                onValueChange={(value) => setFormData({ ...formData, warehouseId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingWarehouses ? (
                    <SelectItem value="loading" disabled>Loading warehouses...</SelectItem>
                  ) : warehouses.length > 0 ? (
                    warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.location})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-warehouses" disabled>No warehouses available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.modelCompatibility.length > 0 && (
            <div className="border p-2 rounded-md bg-slate-50 mb-4">
              <p className="text-sm font-medium mb-1">Selected Models:</p>
              <div className="flex flex-wrap gap-1">
                {formData.modelCompatibility.map(model => (
                  <span key={model} className="bg-slate-200 px-2 py-1 rounded text-xs">
                    {model}
                  </span>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Item/Part</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedOpeningStockForm;
