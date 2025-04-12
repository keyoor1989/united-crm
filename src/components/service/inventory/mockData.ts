
import { InventoryItem } from "@/types/inventory";

// Mock inventory items for testing the engineer inventory management
export const mockInventoryItems: InventoryItem[] = [
  {
    id: "1",
    modelId: "mdl-1",
    brandId: "brd-1",
    name: "Kyocera TK-1175 Toner",
    type: "Toner",
    minQuantity: 5,
    currentQuantity: 12,
    lastPurchasePrice: 1200,
    lastVendor: "Ajanta Traders",
    barcode: "TK1175001",
    createdAt: "2025-01-15"
  },
  {
    id: "2",
    modelId: "mdl-2",
    brandId: "brd-2",
    name: "Ricoh MP2014 Drum Unit",
    type: "Drum",
    minQuantity: 2,
    currentQuantity: 5,
    lastPurchasePrice: 3500,
    lastVendor: "Ravi Distributors",
    barcode: "RM2014D001",
    createdAt: "2025-01-20"
  },
  {
    id: "3",
    modelId: "mdl-1",
    brandId: "brd-1",
    name: "Kyocera 2554ci Fuser",
    type: "Fuser",
    minQuantity: 1,
    currentQuantity: 3,
    lastPurchasePrice: 8000,
    lastVendor: "Precision Equipments",
    barcode: "K2554F001",
    createdAt: "2025-02-05"
  },
  {
    id: "4",
    modelId: "mdl-3",
    brandId: "brd-3",
    name: "Canon NPG-59 Toner",
    type: "Toner",
    minQuantity: 4,
    currentQuantity: 8,
    lastPurchasePrice: 1500,
    lastVendor: "Ajanta Traders",
    barcode: "CNPG59001",
    createdAt: "2025-02-10"
  },
  {
    id: "5",
    modelId: "mdl-4",
    brandId: "brd-4",
    name: "HP 88A Toner",
    type: "Toner",
    minQuantity: 6,
    currentQuantity: 10,
    lastPurchasePrice: 980,
    lastVendor: "Ravi Distributors",
    barcode: "HP88A001",
    createdAt: "2025-02-15"
  }
];
