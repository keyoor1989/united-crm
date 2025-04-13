
export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstNo?: string;
  createdAt: string;
}

export interface VendorPerformanceMetric {
  id: string;
  vendorId: string;
  period: string;
  totalOrders: number;
  onTimeDelivery: number;
  avgDeliveryTime: number;
  priceConsistency: number;
  productQuality: number;
  returnRate: number;
  reliabilityScore: number;
  createdAt: string;
}

// Extended InventoryItem interface with all needed properties
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  unitCost: number;
  unitPrice: number;
  location: string;
  lastRestocked: string;
  createdAt: string;
  
  // Additional properties used throughout the application
  brandId?: string;
  modelId?: string;
  type?: string;
  minQuantity?: number;
  currentQuantity?: number;
  lastPurchasePrice?: number;
  lastVendor?: string;
  barcode?: string;
}

// Additional types used in the inventory system
export type ItemType = "Toner" | "Drum" | "Developer" | "Fuser" | "Paper Feed" | "Other";

export interface Brand {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Model {
  id: string;
  brandId: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  isActive: boolean;
  createdAt: string;
}

export interface WarehouseStock {
  id: string;
  warehouseId: string;
  itemId: string;
  quantity: number;
  lastUpdated: string;
}

export interface PurchaseEntry {
  id: string;
  itemId: string;
  quantity: number;
  purchaseRate: number;
  vendorId: string;
  vendorName: string;
  warehouseId: string;
  warehouseName: string;
  purchaseDate: string;
  invoiceNo: string;
  barcode: string;
  printBarcode: boolean;
  createdAt: string;
}

// AMC related interfaces
export interface AMCContract {
  id: string;
  customerId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  contractType: string;
  status: string;
  monthlyRent: number;
  gstPercent: number;
  copyLimitA4: number;
  copyLimitA3: number;
  extraA4CopyCharge: number;
  extraA3CopyCharge: number;
  billingCycle: string;
  notes?: string;
  createdAt: string;
}

export interface AMCMachine {
  id: string;
  contractId: string;
  customerId: string;
  customerName: string;
  serialNumber: string;
  machineType: string;
  model: string;
  location: string;
  department?: string;
  currentRent: number;
  copyLimitA4: number;
  copyLimitA3: number;
  lastA4Reading: number;
  lastA3Reading: number;
  lastReadingDate?: string;
  startDate: string;
  endDate: string;
  contractType: string;
  createdAt: string;
}

export interface AMCBilling {
  id: string;
  contractId: string;
  machineId: string;
  customerId: string;
  customerName: string;
  department?: string;
  serialNumber: string;
  machineType: string;
  machineModel: string;
  billingMonth: string;
  billDate: string;
  a4OpeningReading: number;
  a4ClosingReading: number;
  a4TotalCopies: number;
  a4FreeCopies: number;
  a4ExtraCopies: number;
  a4ExtraCopyRate: number;
  a4ExtraCopyCharge: number;
  a3OpeningReading: number;
  a3ClosingReading: number;
  a3TotalCopies: number;
  a3FreeCopies: number;
  a3ExtraCopies: number;
  a3ExtraCopyRate: number;
  a3ExtraCopyCharge: number;
  rent: number;
  gstPercent: number;
  gstAmount: number;
  rentGst: number;
  totalBill: number;
  billStatus: string;
  invoiceNo?: string;
  createdAt: string;
}

export interface AMCProfitReport {
  id: string;
  contractId: string;
  machineId: string;
  customerId: string;
  customerName: string;
  department?: string;
  serialNumber: string;
  machineType: string;
  machineModel: string;
  month: string;
  rentReceived: number;
  extraCopyIncome: number;
  totalIncome: number;
  consumablesCost: number;
  engineerVisitCost: number;
  travelExpense: number;
  foodExpense: number;
  otherExpense: number;
  totalExpense: number;
  profit: number;
  profitMargin: number;
  createdAt: string;
}

export interface AMCConsumableUsage {
  id: string;
  contractId: string;
  machineId: string;
  customerId: string;
  customerName: string;
  department?: string;
  serialNumber: string;
  machineType: string;
  machineModel: string;
  date: string;
  itemId: string;
  itemName: string;
  quantity: number;
  cost: number;
  engineerId?: string;
  engineerName?: string;
  inventoryDeducted: boolean;
  remarks?: string;
  createdAt: string;
}

export type IssueType = "Engineer" | "Customer" | "Warehouse Transfer";
export type ReturnReason = "Unused" | "Defective" | "Wrong Part" | "Expired" | "Other";
export type ReturnStatus = "Good" | "Damaged" | "Expired";
