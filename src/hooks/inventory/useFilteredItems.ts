
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

  // Get compatible models based on all items
  const models = useMemo(() => {
    const modelSet = new Set<string>();
    items.forEach(item => {
      if (item.compatible_models && Array.isArray(item.compatible_models)) {
        item.compatible_models.forEach(model => {
          if ((!selectedBrand || item.brand === selectedBrand) && model) {
            modelSet.add(model);
          }
        });
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
        ? (item.compatible_models && 
           Array.isArray(item.compatible_models) && 
           item.compatible_models.includes(selectedModel))
        : true;
      
      return matchesSearch && matchesBrand && matchesModel;
    });
  }, [items, searchTerm, selectedBrand, selectedModel]);

  return { brands, models, filteredItems };
};
