
import { InventoryItem } from "@/types/inventory";

// Sample inventory data for demo purposes
// In a real app, this would come from an API or database
const inventoryItems: Partial<InventoryItem>[] = [
  {
    id: "INV001",
    name: "Ricoh 2014 Drum Unit",
    category: "Drum",
    brand: "BRAND001",
    currentQuantity: 8,
    minQuantity: 5,
    lastPurchasePrice: 3500,
    lastVendor: "Tech Supplies Ltd",
    barcode: "RCH-DRM-2014",
  },
  {
    id: "INV002",
    name: "Kyocera 2554ci Toner Black",
    category: "Toner",
    brand: "BRAND002",
    currentQuantity: 12,
    minQuantity: 4,
    lastPurchasePrice: 5200,
    lastVendor: "Kyocera Official",
    barcode: "KYO-TNR-2554-BK",
  },
  {
    id: "INV003",
    name: "Sharp 261 Developer",
    category: "Developer",
    brand: "BRAND003",
    currentQuantity: 0,
    minQuantity: 2,
    lastPurchasePrice: 2800,
    lastVendor: "Sharp Distributors",
    barcode: "SHP-DEV-261",
  },
  {
    id: "INV004",
    name: "Canon IR2525 Toner",
    category: "Toner",
    brand: "BRAND004",
    currentQuantity: 3,
    minQuantity: 3,
    lastPurchasePrice: 4200,
    lastVendor: "Canon India Ltd",
    barcode: "CAN-TNR-2525",
  },
  {
    id: "INV005",
    name: "HP LaserJet Pro M428 Toner",
    category: "Toner",
    brand: "BRAND005",
    currentQuantity: 6,
    minQuantity: 4,
    lastPurchasePrice: 3900,
    lastVendor: "HP Enterprise Solutions",
    barcode: "HP-TNR-M428",
  },
  {
    id: "INV006",
    name: "Kyocera 2040 Drum Unit",
    category: "Drum",
    brand: "BRAND002",
    currentQuantity: 4,
    minQuantity: 2,
    lastPurchasePrice: 5500,
    lastVendor: "Kyocera Official",
    barcode: "KYO-DRM-2040",
  },
  {
    id: "INV007",
    name: "Ricoh MP2014 Toner",
    category: "Toner",
    brand: "BRAND001",
    currentQuantity: 2,
    minQuantity: 3,
    lastPurchasePrice: 2800,
    lastVendor: "Tech Supplies Ltd",
    barcode: "RCH-TNR-MP2014",
  },
  {
    id: "INV008",
    name: "Sharp MX3070 Developer",
    category: "Developer",
    brand: "BRAND003",
    currentQuantity: 5,
    minQuantity: 2,
    lastPurchasePrice: 6500,
    lastVendor: "Sharp Distributors",
    barcode: "SHP-DEV-MX3070",
  }
];

// Interface for parsed inventory query
export interface ParsedInventoryQuery {
  brand?: string;
  model?: string;
  itemType?: string;
  query: string;
  matchedItems: Partial<InventoryItem>[];
  lastUpdated: Date; // In real app, this would come from database
}

/**
 * Parse inventory command from message
 * Examples:
 * - "Check stock for Ricoh 2014 drum"
 * - "Inventory status for Kyocera toner"
 * - "Kitna stock hai Sharp 261 ka developer ka?"
 */
export const parseInventoryCommand = (message: string): ParsedInventoryQuery => {
  const result: ParsedInventoryQuery = {
    query: message,
    matchedItems: [],
    lastUpdated: new Date() // Mock last updated time
  };
  
  // Convert to lowercase for easier matching
  const lowerMessage = message.toLowerCase();
  
  // Common brands in the industry
  const brands = ["ricoh", "kyocera", "sharp", "canon", "hp", "xerox", "konica", "minolta", "brother"];
  
  // Common item types
  const itemTypes = ["toner", "drum", "developer", "fuser", "maintenance kit", "paper feed"];
  
  // Search for brand
  for (const brand of brands) {
    if (lowerMessage.includes(brand)) {
      result.brand = brand.charAt(0).toUpperCase() + brand.slice(1); // Capitalize first letter
      break;
    }
  }
  
  // Search for item type
  for (const type of itemTypes) {
    if (lowerMessage.includes(type)) {
      result.itemType = type.charAt(0).toUpperCase() + type.slice(1); // Capitalize first letter
      break;
    }
  }
  
  // Try to extract model number - looking for patterns like digits or known model series
  const modelPatterns = [
    /\b\d{3,4}\b/, // 3-4 digit numbers (e.g., 2014, 261)
    /\b\d{4}ci\b/i, // 4 digits followed by ci (e.g., 2554ci)
    /\bir\s*\d{4}\b/i, // IR followed by numbers (e.g., IR2525)
    /\bmp\s*\d{4}\b/i, // MP followed by numbers (e.g., MP2014)
    /\bmx\s*\d{4}\b/i, // MX followed by numbers (e.g., MX3070)
    /\bm\d{3}\b/i, // M followed by 3 digits (e.g., M428)
  ];
  
  for (const pattern of modelPatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      result.model = match[0].toUpperCase();
      break;
    }
  }
  
  // Search for items matching the criteria
  result.matchedItems = inventoryItems.filter(item => {
    const itemName = item.name?.toLowerCase() || "";
    let matches = true;
    
    if (result.brand && !itemName.includes(result.brand.toLowerCase())) {
      matches = false;
    }
    
    if (result.model && !itemName.includes(result.model.toLowerCase())) {
      matches = false;
    }
    
    if (result.itemType && item.category?.toLowerCase() !== result.itemType.toLowerCase()) {
      matches = false;
    }
    
    return matches;
  });
  
  // If no specific criteria or no matches found, return similar items
  if (result.matchedItems.length === 0) {
    // If brand is specified but no other criteria, return all items from that brand
    if (result.brand) {
      result.matchedItems = inventoryItems.filter(item => 
        item.name?.toLowerCase().includes(result.brand!.toLowerCase())
      );
    } 
    // If item type is specified but no other criteria, return all items of that type
    else if (result.itemType) {
      result.matchedItems = inventoryItems.filter(item => 
        item.category?.toLowerCase() === result.itemType?.toLowerCase()
      );
    }
  }
  
  return result;
};

/**
 * Get status emoji based on inventory quantity
 */
export const getStockStatusEmoji = (item: Partial<InventoryItem>): string => {
  if (item.currentQuantity === undefined) return "❓";
  if (item.currentQuantity <= 0) return "❌";
  if (item.currentQuantity < (item.minQuantity || 0)) return "⚠️";
  return "✅";
};

/**
 * Get status text based on inventory quantity
 */
export const getStockStatusText = (item: Partial<InventoryItem>): { text: string; color: string } => {
  if (item.currentQuantity === undefined) {
    return { text: "Unknown", color: "text-gray-500" };
  }
  if (item.currentQuantity <= 0) {
    return { text: "Out of Stock", color: "text-red-600" };
  }
  if (item.currentQuantity < (item.minQuantity || 0)) {
    return { text: "Low Stock", color: "text-amber-600" };
  }
  return { text: "In Stock", color: "text-green-600" };
};

/**
 * Find similar items for recommendation when exact match not found
 */
export const findSimilarItems = (query: string): Partial<InventoryItem>[] => {
  // Simple similarity matching - checks if any words from query appear in item name
  const queryWords = query.toLowerCase().split(/\s+/);
  
  return inventoryItems.filter(item => {
    if (!item.name) return false;
    
    const itemNameLower = item.name.toLowerCase();
    return queryWords.some(word => {
      // Only consider words with 3+ chars to avoid common words
      return word.length >= 3 && itemNameLower.includes(word);
    });
  }).slice(0, 3); // Limit to top 3 similar items
};

export default {
  parseInventoryCommand,
  getStockStatusEmoji,
  getStockStatusText,
  findSimilarItems
};
