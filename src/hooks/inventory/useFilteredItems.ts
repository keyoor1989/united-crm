
import { useMemo } from "react";
import { InventoryItem } from "./useInventoryItems";

export const useFilteredItems = (
  items: InventoryItem[],
  searchTerm: string,
  selectedBrand: string,
  selectedModel: string
) => {
  // Extract unique brands from items
  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    items.forEach(item => {
      if (item.brand) {
        brandSet.add(item.brand);
      }
    });
    return Array.from(brandSet).sort();
  }, [items]);

  // Get categories (models) based on selected brand
  const models = useMemo(() => {
    const modelSet = new Set<string>();
    items.forEach(item => {
      if ((!selectedBrand || item.brand === selectedBrand) && item.category) {
        modelSet.add(item.category);
      }
    });
    return Array.from(modelSet).sort();
  }, [items, selectedBrand]);

  // Filter items based on search term, brand and model
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = searchTerm 
        ? item.part_name.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      const matchesBrand = selectedBrand 
        ? item.brand === selectedBrand 
        : true;
      
      const matchesModel = selectedModel 
        ? item.category === selectedModel 
        : true;
      
      return matchesSearch && matchesBrand && matchesModel;
    });
  }, [items, searchTerm, selectedBrand, selectedModel]);

  return { brands, models, filteredItems };
};
