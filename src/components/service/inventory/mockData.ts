
import { InventoryItem } from "@/types/inventory";

// Sample inventory items
export const mockInventoryItems: InventoryItem[] = [
  { 
    id: "item1", 
    modelId: "model1", 
    brandId: "brand1", 
    name: "Kyocera TK-1175 Toner", 
    type: "Toner", 
    minQuantity: 5, 
    currentQuantity: 12, 
    lastPurchasePrice: 4500, 
    lastVendor: "Kyocera Distributor", 
    barcode: "KYO-TK1175", 
    createdAt: "2025-03-15T10:00:00Z" 
  },
  { 
    id: "item2", 
    modelId: "model2", 
    brandId: "brand2", 
    name: "Canon NPG-59 Drum Unit", 
    type: "Drum", 
    minQuantity: 2, 
    currentQuantity: 4, 
    lastPurchasePrice: 6800, 
    lastVendor: "Canon India", 
    barcode: "CAN-NPG59", 
    createdAt: "2025-03-18T10:00:00Z" 
  },
  { 
    id: "item3", 
    modelId: "model3", 
    brandId: "brand1", 
    name: "Ricoh 1015 Drum Unit", 
    type: "Drum", 
    minQuantity: 1, 
    currentQuantity: 3, 
    lastPurchasePrice: 7500, 
    lastVendor: "Ricoh Distributor", 
    barcode: "RIC-1015-DRM", 
    createdAt: "2025-03-20T10:00:00Z" 
  },
  { 
    id: "item4", 
    modelId: "model4", 
    brandId: "brand2", 
    name: "Drum Cleaning Blade", 
    type: "Other", 
    minQuantity: 5, 
    currentQuantity: 15, 
    lastPurchasePrice: 500, 
    lastVendor: "Parts Supplier", 
    barcode: "DCB-UNIVERSAL", 
    createdAt: "2025-03-25T10:00:00Z" 
  }
];
