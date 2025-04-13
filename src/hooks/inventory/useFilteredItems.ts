
import { useEffect, useState } from 'react';
import { InventoryItem } from '@/types/inventory';

/**
 * Custom hook to filter inventory items based on search, brand and model
 * @param items - The list of inventory items
 * @param searchQuery - The search query
 * @param selectedBrand - Optional selected brand ID
 * @param selectedModel - Optional selected model ID
 * @returns Filtered items
 */
export const useFilteredItems = (
  items: InventoryItem[],
  searchQuery: string,
  selectedBrand?: string | null,
  selectedModel?: string | null
) => {
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  
  useEffect(() => {
    let filtered = [...items];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.brand && item.brand.toLowerCase().includes(query)) ||
        (item.type && item.type.toLowerCase().includes(query)) ||
        (item.barcode && item.barcode.toLowerCase().includes(query))
      );
    }
    
    // Filter by brand
    if (selectedBrand) {
      filtered = filtered.filter(item => item.brandId === selectedBrand);
    }
    
    // Filter by model
    if (selectedModel) {
      filtered = filtered.filter(item => item.modelId === selectedModel);
    }
    
    setFilteredItems(filtered);
  }, [items, searchQuery, selectedBrand, selectedModel]);
  
  // Calculate some useful stats from the filtered items
  const totalItems = filteredItems.length;
  const totalStock = filteredItems.reduce((sum, item) => sum + (item.currentQuantity || 0), 0);
  const lowStockItems = filteredItems.filter(item => 
    (item.currentQuantity !== undefined && item.minQuantity !== undefined) && 
    item.currentQuantity < item.minQuantity
  ).length;
  
  return {
    filteredItems,
    totalItems,
    totalStock,
    lowStockItems
  };
};
