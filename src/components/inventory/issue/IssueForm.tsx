
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Package } from "lucide-react";
import WarehouseSelector from "@/components/inventory/warehouses/WarehouseSelector";
import { useWarehouses } from "@/hooks/warehouses/useWarehouses";
import { useEngineers } from "@/hooks/inventory/useEngineers";
import { useInventoryItems } from "@/hooks/inventory/useInventoryItems";
import { useFilteredItems } from "@/hooks/inventory/useFilteredItems";
import { useIssueItem } from "@/hooks/inventory/useIssueItem";
import ItemsTable from "./ItemsTable";

// Type definition for issue types
type IssueType = "Engineer" | "Customer" | "Branch";

// Mock data for customers & branches (to be replaced with real API calls later)
const customers = [
  { id: "1", name: "ABC Technologies" },
  { id: "2", name: "XYZ Solutions" },
  { id: "3", name: "Tech Innovations" }
];

const branches = [
  { id: "1", name: "Indore Office" },
  { id: "2", name: "Bhopal Office" },
  { id: "3", name: "Jabalpur Office" }
];

const IssueForm = () => {
  // State
  const [issueType, setIssueType] = useState<IssueType>("Engineer");
  const [selectedReceiver, setSelectedReceiver] = useState<string>("");
  const [receiverName, setReceiverName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all_brands");
  const [selectedModel, setSelectedModel] = useState("all_models");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [modelNumber, setModelNumber] = useState<string>("");
  const [modelBrand, setModelBrand] = useState<string>("");

  // Hooks
  const { warehouses, isLoadingWarehouses } = useWarehouses();
  const { engineers, isLoading: isLoadingEngineers } = useEngineers();
  const { items, isLoading: isLoadingItems } = useInventoryItems(selectedWarehouse);
  const { brands, models, filteredItems } = useFilteredItems(
    items,
    searchTerm,
    selectedBrand,
    selectedModel
  );
  const issueMutation = useIssueItem();

  // Event handlers
  const handleReceiverSelect = (value: string) => {
    if (!value || value === "loading" || value === "no-items") return;
    
    const [id, name] = value.split('|');
    setSelectedReceiver(id);
    setReceiverName(name);
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    
    // Auto-fill brand and model based on selected item
    const selectedItem = items.find(item => item.id === itemId);
    if (selectedItem) {
      setModelBrand(selectedItem.brand || "");
      setModelNumber(Array.isArray(selectedItem.compatible_models) && selectedItem.compatible_models.length > 0 
        ? selectedItem.compatible_models[0] 
        : "");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId) {
      return;
    }

    if (!selectedReceiver || !receiverName) {
      return;
    }

    if (quantity <= 0) {
      return;
    }

    const selectedItem = items.find(item => item.id === selectedItemId);
    if (!selectedItem) return;

    const warehouseInfo = warehouses.find(w => w.id === selectedWarehouse);
    
    console.log("Issuing item with model and brand:", {
      itemId: selectedItemId,
      modelNumber,
      modelBrand,
      quantity
    });
    
    issueMutation.mutate({
      itemId: selectedItemId,
      engineerId: selectedReceiver,
      engineerName: receiverName,
      itemName: selectedItem.part_name,
      quantity,
      warehouseId: selectedWarehouse,
      warehouseName: warehouseInfo?.name || null,
      modelNumber: modelNumber || null,
      modelBrand: modelBrand || null
    }, {
      onSuccess: () => {
        // Reset form
        setSelectedItemId(null);
        setQuantity(1);
        setSelectedReceiver("");
        setReceiverName("");
        setModelNumber("");
        setModelBrand("");
      }
    });
  };

  const selectedItem = selectedItemId ? items.find(item => item.id === selectedItemId) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Warehouse Selection */}
      <div className="mb-6">
        <Label className="text-base font-medium mb-2 block">Select Warehouse</Label>
        <WarehouseSelector 
          warehouses={warehouses}
          selectedWarehouse={selectedWarehouse}
          onSelectWarehouse={setSelectedWarehouse}
          isLoading={isLoadingWarehouses}
        />
      </div>

      {/* Issue Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="issueType">Issue Type</Label>
          <Select 
            value={issueType} 
            onValueChange={(value) => {
              setIssueType(value as IssueType);
              setSelectedReceiver("");
              setReceiverName("");
            }}
          >
            <SelectTrigger id="issueType">
              <SelectValue placeholder="Select issue type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Engineer">Engineer</SelectItem>
              <SelectItem value="Customer">Customer</SelectItem>
              <SelectItem value="Branch">Branch</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="receiver">{issueType} Name</Label>
          <Select 
            onValueChange={handleReceiverSelect}
          >
            <SelectTrigger id="receiver">
              <SelectValue placeholder={`Select ${issueType.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {isLoadingEngineers && issueType === "Engineer" ? (
                <SelectItem value="loading" disabled>Loading engineers...</SelectItem>
              ) : issueType === "Engineer" && engineers.length > 0 ? (
                engineers.map(engineer => (
                  <SelectItem key={engineer.id} value={`${engineer.id}|${engineer.name}`}>
                    {engineer.name}
                  </SelectItem>
                ))
              ) : issueType === "Engineer" ? (
                <SelectItem value="no-items" disabled>No engineers found</SelectItem>
              ) : null}
              
              {issueType === "Customer" && customers.map(customer => (
                <SelectItem key={customer.id} value={`${customer.id}|${customer.name}`}>
                  {customer.name}
                </SelectItem>
              ))}
              
              {issueType === "Branch" && branches.map(branch => (
                <SelectItem key={branch.id} value={`${branch.id}|${branch.name}`}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Item Selection */}
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-4">Item Details</h3>
        
        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute top-3 left-3 text-gray-500" />
            <Input 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-md"
            />
          </div>
          
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger>
              <SelectValue placeholder="Select Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_brands">All Brands</SelectItem>
              {brands.map(brand => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedModel} 
            onValueChange={setSelectedModel}
            disabled={models.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_models">All Models</SelectItem>
              {models.map(model => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Items Table */}
        <ItemsTable 
          filteredItems={filteredItems}
          selectedItemId={selectedItemId}
          handleSelectItem={handleItemSelect}
          isLoading={isLoadingItems}
        />
        
        {/* Quantity Selection */}
        {selectedItem && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={selectedItem.quantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="h-11"
                required
              />
            </div>
            
            <div className="flex items-end">
              <div className="text-sm">
                <p className="font-medium">{selectedItem.part_name}</p>
                <p className="text-muted-foreground">Current Stock: {selectedItem.quantity}</p>
                <p className={selectedItem.quantity < selectedItem.min_stock ? "text-destructive" : "text-green-600"}>
                  Status: {selectedItem.quantity < selectedItem.min_stock ? "Low Stock" : "In Stock"}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Model and Brand Information */}
        {selectedItem && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modelNumber">Model Number</Label>
              <Input
                id="modelNumber"
                placeholder="e.g., TK-8115"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modelBrand">Brand</Label>
              <Input
                id="modelBrand"
                placeholder="e.g., Kyocera"
                value={modelBrand}
                onChange={(e) => setModelBrand(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full mt-6" 
        disabled={!selectedItemId || !selectedWarehouse || !selectedReceiver || issueMutation.isPending}
      >
        {issueMutation.isPending ? (
          <>Processing...</>
        ) : (
          <>
            <Package className="mr-2 h-4 w-4" />
            Issue Item
          </>
        )}
      </Button>
    </form>
  );
};

export default IssueForm;
