
import { useMemo } from 'react';
import { InventoryItem } from '@/types/inventory';

export const useFilteredItems = (
  items: InventoryItem[],
  searchTerm: string,
  selectedBrand: string,
  selectedModel: string
) => {
  // Extract unique brands from items
  const brands = useMemo(() => {
    const uniqueBrands = new Set<string>();
    items.forEach(item => {
      if (item.brandId) {
        uniqueBrands.add(item.brandId);
      }
    });
    return Array.from(uniqueBrands).sort();
  }, [items]);

  // Extract unique models based on selected brand
  const models = useMemo(() => {
    const uniqueModels = new Set<string>();
    items.forEach(item => {
      if (
        item.modelId && 
        (!selectedBrand || selectedBrand === 'all_brands' || item.brandId === selectedBrand)
      ) {
        uniqueModels.add(item.modelId);
      }
    });
    return Array.from(uniqueModels).sort();
  }, [items, selectedBrand]);

  // Filter items based on search term, brand, and model
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Apply search filter
      const matchesSearch = !searchTerm || 
        item.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.part_number && item.part_number.toLowerCase().includes(searchTerm.toLowerCase()));

      // Apply brand filter
      const matchesBrand = !selectedBrand || 
        selectedBrand === 'all_brands' || 
        item.brandId === selectedBrand;

      // Apply model filter
      const matchesModel = !selectedModel || 
        selectedModel === 'all_models' || 
        item.modelId === selectedModel;

      return matchesSearch && matchesBrand && matchesModel;
    });
  }, [items, searchTerm, selectedBrand, selectedModel]);

  return { brands, models, filteredItems };
};
