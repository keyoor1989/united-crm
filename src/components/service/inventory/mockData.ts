
import { InventoryItem } from "@/types/inventory";

// Mock inventory items for testing the engineer inventory management
export const mockInventoryItems: InventoryItem[] = [
  {
    id: "1",
    model: "mdl-1",
    brand: "brd-1",
    name: "Kyocera TK-1175 Toner",
    category: "Toner",
    minStockLevel: 5,
    currentStock: 12,
    unitCost: 1200,
    location: "",
    lastRestocked: "",
    createdAt: "2025-01-15",
    // Additional properties
    modelId: "mdl-1",
    brandId: "brd-1",
    type: "Toner",
    minQuantity: 5,
    currentQuantity: 12,
    lastPurchasePrice: 1200,
    lastVendor: "Ajanta Traders",
    barcode: "TK1175001",
  },
  {
    id: "2",
    model: "mdl-2",
    brand: "brd-2",
    name: "Ricoh MP2014 Drum Unit",
    category: "Drum",
    minStockLevel: 2,
    currentStock: 5,
    unitCost: 3500,
    location: "",
    lastRestocked: "",
    createdAt: "2025-01-20",
    // Additional properties
    modelId: "mdl-2",
    brandId: "brd-2",
    type: "Drum",
    minQuantity: 2,
    currentQuantity: 5,
    lastPurchasePrice: 3500,
    lastVendor: "Ravi Distributors",
    barcode: "RM2014D001",
  },
  {
    id: "3",
    model: "mdl-1",
    brand: "brd-1",
    name: "Kyocera 2554ci Fuser",
    category: "Fuser",
    minStockLevel: 1,
    currentStock: 3,
    unitCost: 8000,
    location: "",
    lastRestocked: "",
    createdAt: "2025-02-05",
    // Additional properties
    modelId: "mdl-1",
    brandId: "brd-1",
    type: "Fuser",
    minQuantity: 1,
    currentQuantity: 3,
    lastPurchasePrice: 8000,
    lastVendor: "Precision Equipments",
    barcode: "K2554F001",
  },
  {
    id: "4",
    model: "mdl-3",
    brand: "brd-3",
    name: "Canon NPG-59 Toner",
    category: "Toner",
    minStockLevel: 4,
    currentStock: 8,
    unitCost: 1500,
    location: "",
    lastRestocked: "",
    createdAt: "2025-02-10",
    // Additional properties
    modelId: "mdl-3",
    brandId: "brd-3",
    type: "Toner",
    minQuantity: 4,
    currentQuantity: 8,
    lastPurchasePrice: 1500,
    lastVendor: "Ajanta Traders",
    barcode: "CNPG59001",
  },
  {
    id: "5",
    model: "mdl-4",
    brand: "brd-4",
    name: "HP 88A Toner",
    category: "Toner",
    minStockLevel: 6,
    currentStock: 10,
    unitCost: 980,
    location: "",
    lastRestocked: "",
    createdAt: "2025-02-15",
    // Additional properties
    modelId: "mdl-4",
    brandId: "brd-4",
    type: "Toner",
    minQuantity: 6,
    currentQuantity: 10,
    lastPurchasePrice: 980,
    lastVendor: "Ravi Distributors",
    barcode: "HP88A001",
  },
  {
    id: "6",
    model: "mdl-5",
    brand: "brd-1",
    name: "Kyocera 2554ci Drum",
    category: "Drum",
    minStockLevel: 1,
    currentStock: 4,
    unitCost: 7500,
    location: "",
    lastRestocked: "",
    createdAt: "2025-03-01",
    // Additional properties
    modelId: "mdl-5",
    brandId: "brd-1",
    type: "Drum",
    minQuantity: 1,
    currentQuantity: 4,
    lastPurchasePrice: 7500,
    lastVendor: "Precision Equipments",
    barcode: "K2554D001",
  }
];

// Mock data for engineer inventory items
export const mockEngineerInventory = [
  { 
    id: "1", 
    engineerId: "eng-1", 
    engineerName: "Rajesh Kumar", 
    itemId: "1", 
    itemName: "Kyocera TK-1175 Toner", 
    quantity: 2, 
    assignedDate: "2025-03-15",
    warehouseSource: "Joshiji"
  },
  { 
    id: "2", 
    engineerId: "eng-2", 
    engineerName: "Deepak Sharma", 
    itemId: "2", 
    itemName: "Ricoh MP2014 Drum Unit", 
    quantity: 1, 
    assignedDate: "2025-03-10",
    warehouseSource: "Joshiji"
  },
  { 
    id: "3", 
    engineerId: "eng-1", 
    engineerName: "Rajesh Kumar", 
    itemId: "3", 
    itemName: "Kyocera 2554ci Fuser", 
    quantity: 1, 
    assignedDate: "2025-02-28",
    warehouseSource: "Joshiji"
  },
  { 
    id: "4", 
    engineerId: "eng-4", 
    engineerName: "Amit Singh", 
    itemId: "6", 
    itemName: "Kyocera 2554ci Drum", 
    quantity: 2, 
    assignedDate: "2025-04-12",
    warehouseSource: "Joshiji"
  }
];

// Mock data for usage history on service calls
export const mockUsageHistory = [
  { 
    id: "1", 
    engineerId: "eng-1", 
    engineerName: "Rajesh Kumar", 
    itemId: "1", 
    itemName: "Kyocera TK-1175 Toner", 
    quantity: 1, 
    date: "2025-03-20", 
    serviceCallId: "SC001", 
    customerName: "ABC Corp" 
  },
  { 
    id: "2", 
    engineerId: "eng-2", 
    engineerName: "Deepak Sharma", 
    itemId: "2", 
    itemName: "Ricoh MP2014 Drum Unit", 
    quantity: 1, 
    date: "2025-03-15", 
    serviceCallId: "SC002", 
    customerName: "XYZ Ltd" 
  },
  { 
    id: "3", 
    engineerId: "eng-4", 
    engineerName: "Amit Singh", 
    itemId: "6", 
    itemName: "Kyocera 2554ci Drum", 
    quantity: 1, 
    date: "2025-04-12", 
    serviceCallId: "SC003", 
    customerName: "Tech Solutions" 
  }
];

// Mock data for returns history
export const mockReturns = [
  {
    id: "r1",
    engineerId: "eng-1",
    engineerName: "Rajesh Kumar",
    itemId: "1",
    itemName: "Kyocera TK-1175 Toner",
    quantity: 1,
    returnDate: "2025-04-10",
    reason: "Unused",
    condition: "Good",
    warehouseId: "wh-1",
    warehouseName: "Joshiji"
  },
  {
    id: "r2",
    engineerId: "eng-4",
    engineerName: "Amit Singh",
    itemId: "6",
    itemName: "Kyocera 2554ci Drum",
    quantity: 1,
    returnDate: "2025-04-11",
    reason: "Defective",
    condition: "Damaged",
    warehouseId: "wh-1",
    warehouseName: "Joshiji"
  }
];

// Types for database integration
export type EngineerInventoryItem = {
  id: string;
  engineer_id: string;
  engineer_name: string;
  item_id: string;
  item_name: string;
  quantity: number;
  assigned_date: string;
  warehouse_id?: string;
  warehouse_source?: string;
  created_at?: string;
};

export type InventoryReturnItem = {
  id: string;
  engineer_id: string;
  engineer_name: string;
  item_id: string;
  item_name: string;
  quantity: number;
  return_date: string;
  reason: string;
  condition: string;
  warehouse_id?: string;
  warehouse_name?: string;
  notes?: string;
  created_at?: string;
};
