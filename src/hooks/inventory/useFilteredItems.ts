
import { useMemo } from 'react';
import { InventoryItem as BaseInventoryItem } from '@/types/inventory';
import { InventoryItem, adaptInventoryItem } from './useInventoryItems';

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
      if (item.brand) {
        uniqueBrands.add(item.brand);
      } else if (item.brandId) {
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
        item.modelId || 
        (item.compatible_models && Array.isArray(item.compatible_models)) ||
        (item.compatible_models && typeof item.compatible_models === 'string')
      ) {
        if (!selectedBrand || selectedBrand === 'all_brands' || 
            item.brandId === selectedBrand || item.brand === selectedBrand) {
          
          if (item.modelId) {
            uniqueModels.add(item.modelId);
          } else if (item.compatible_models) {
            if (Array.isArray(item.compatible_models)) {
              item.compatible_models.forEach(model => uniqueModels.add(model));
            } else if (typeof item.compatible_models === 'string') {
              try {
                const parsedModels = JSON.parse(item.compatible_models);
                if (Array.isArray(parsedModels)) {
                  parsedModels.forEach(model => uniqueModels.add(model));
                }
              } catch (e) {
                // If it's not valid JSON, just add it as a string
                uniqueModels.add(item.compatible_models);
              }
            }
          }
        }
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
        item.brandId === selectedBrand || 
        item.brand === selectedBrand;

      // Apply model filter
      let matchesModel = !selectedModel || selectedModel === 'all_models';
      
      if (!matchesModel && item.modelId === selectedModel) {
        matchesModel = true;
      }
      
      if (!matchesModel && item.compatible_models) {
        if (Array.isArray(item.compatible_models) && item.compatible_models.includes(selectedModel)) {
          matchesModel = true;
        } else if (typeof item.compatible_models === 'string') {
          try {
            const parsedModels = JSON.parse(item.compatible_models);
            if (Array.isArray(parsedModels) && parsedModels.includes(selectedModel)) {
              matchesModel = true;
            }
          } catch (e) {
            // If not valid JSON, check if the string equals selectedModel
            if (item.compatible_models === selectedModel) {
              matchesModel = true;
            }
          }
        }
      }

      return matchesSearch && matchesBrand && matchesModel;
    });
  }, [items, searchTerm, selectedBrand, selectedModel]);

  // Convert filtered items to the app's InventoryItem format
  const adaptedFilteredItems: BaseInventoryItem[] = useMemo(() => {
    return filteredItems.map(adaptInventoryItem);
  }, [filteredItems]);

  return { brands, models, filteredItems, adaptedFilteredItems };
};
