
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ItemFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  brands: string[];
  models: string[];
}

const ItemFilters = ({
  searchTerm,
  setSearchTerm,
  selectedBrand,
  setSelectedBrand,
  selectedModel,
  setSelectedModel,
  brands,
  models,
}: ItemFiltersProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {/* Search */}
      <div>
        <div className="relative">
          <Search className="h-4 w-4 absolute top-3 left-3 text-gray-500" />
          <Input 
            placeholder="Search items..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-md"
          />
        </div>
      </div>
      
      {/* Brand Selection */}
      <div>
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="h-11 rounded-md">
            <SelectValue placeholder="Select Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Brands</SelectItem>
            {brands.map(brand => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Model Selection */}
      <div>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="h-11 rounded-md">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Models</SelectItem>
            {models.map(model => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ItemFilters;
