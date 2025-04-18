
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
import { toast } from "sonner";

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
    modelCompatibility: "",
    partNumber: "",
    quantity: 0,
    minStock: 0,
    purchasePrice: 0,
    location: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.partName || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSubmit(formData);
    setFormData({
      partName: "",
      category: "Spare Part",
      brand: "",
      modelCompatibility: "",
      partNumber: "",
      quantity: 0,
      minStock: 0,
      purchasePrice: 0,
      location: "",
    });
    onOpenChange(false);
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
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Enter brand name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelCompatibility">Compatible Models</Label>
              <Input
                id="modelCompatibility"
                value={formData.modelCompatibility}
                onChange={(e) => setFormData({ ...formData, modelCompatibility: e.target.value })}
                placeholder="Enter compatible models"
              />
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
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
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
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
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
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="location">Storage Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter storage location"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Add Item/Part</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedOpeningStockForm;
