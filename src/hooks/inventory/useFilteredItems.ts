
import { useEffect, useState } from 'react';
import { InventoryItem } from './useInventoryItems';

/**
 * Custom hook to filter inventory items based on search, brand and model
 * @param items - The list of inventory items
 * @param searchQuery - The search query
 * @param selectedBrand - Optional selected brand ID
 * @param selectedModel - Optional selected model ID
 * @returns Filtered items and related filter data
 */
export const useFilteredItems = (
  items: InventoryItem[],
  searchQuery: string,
  selectedBrand?: string | null,
  selectedModel?: string | null
) => {
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  
  // Extract unique brands and models
  useEffect(() => {
    if (items && items.length > 0) {
      // Extract unique brands
      const uniqueBrands = Array.from(new Set(items.map(item => item.brand).filter(Boolean)));
      setBrands(uniqueBrands as string[]);
      
      // Extract unique models (considering the selected brand if applicable)
      let itemsToFilterForModels = items;
      if (selectedBrand && selectedBrand !== 'all_brands') {
        itemsToFilterForModels = items.filter(item => item.brand_id === selectedBrand);
      }
      
      const uniqueModels = Array.from(new Set(itemsToFilterForModels.map(item => {
        // Try to get the model from compatible_models array or use model_id as fallback
        return item.model_id || '';
      }).filter(Boolean)));
      
      setModels(uniqueModels as string[]);
    } else {
      setBrands([]);
      setModels([]);
    }
  }, [items, selectedBrand]);
  
  // Filter items based on search and selections
  useEffect(() => {
    let filtered = [...items];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.part_name.toLowerCase().includes(query) || 
        (item.brand && item.brand.toLowerCase().includes(query)) ||
        (item.type && item.type.toLowerCase().includes(query)) ||
        (item.barcode && item.barcode.toLowerCase().includes(query))
      );
    }
    
    // Filter by brand
    if (selectedBrand && selectedBrand !== 'all_brands') {
      filtered = filtered.filter(item => item.brand_id === selectedBrand);
    }
    
    // Filter by model
    if (selectedModel && selectedModel !== 'all_models') {
      filtered = filtered.filter(item => item.model_id === selectedModel);
    }
    
    setFilteredItems(filtered);
  }, [items, searchQuery, selectedBrand, selectedModel]);
  
  // Calculate some useful stats from the filtered items
  const totalItems = filteredItems.length;
  const totalStock = filteredItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const lowStockItems = filteredItems.filter(item => 
    (item.quantity !== undefined && item.min_stock !== undefined) && 
    item.quantity < item.min_stock
  ).length;
  
  return {
    filteredItems,
    totalItems,
    totalStock,
    lowStockItems,
    brands,
    models
  };
};
