
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
  location?: string;
  department?: string;
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
export type ReturnStatus = "Good" | "Damaged" | "Expired" | "Pending" | "Inspected" | "Restocked" | "Quarantined" | "Returned to Vendor";

// Database to Frontend type adapters (camelCase to snake_case)
export interface DBToFrontendAdapter {
  // AMC Machine adapter
  adaptAMCMachine: (dbMachine: any) => AMCMachine;
  
  // AMC Contract adapter
  adaptAMCContract: (dbContract: any) => AMCContract;
  
  // AMC Billing adapter
  adaptAMCBilling: (dbBilling: any) => AMCBilling;
  
  // AMC Consumable Usage adapter
  adaptAMCConsumableUsage: (dbUsage: any) => AMCConsumableUsage;
}

// Implementation of the adapter
export const dbAdapter: DBToFrontendAdapter = {
  adaptAMCMachine: (dbMachine: any): AMCMachine => ({
    id: dbMachine.id,
    contractId: dbMachine.contract_id,
    customerId: dbMachine.customer_id,
    customerName: dbMachine.customer_name,
    serialNumber: dbMachine.serial_number,
    machineType: dbMachine.machine_type,
    model: dbMachine.model,
    location: dbMachine.location,
    department: dbMachine.department,
    currentRent: dbMachine.current_rent,
    copyLimitA4: dbMachine.copy_limit_a4,
    copyLimitA3: dbMachine.copy_limit_a3,
    lastA4Reading: dbMachine.last_a4_reading,
    lastA3Reading: dbMachine.last_a3_reading,
    lastReadingDate: dbMachine.last_reading_date,
    startDate: dbMachine.start_date,
    endDate: dbMachine.end_date,
    contractType: dbMachine.contract_type,
    createdAt: dbMachine.created_at
  }),
  
  adaptAMCContract: (dbContract: any): AMCContract => ({
    id: dbContract.id,
    customerId: dbContract.customer_id,
    customerName: dbContract.customer_name,
    startDate: dbContract.start_date,
    endDate: dbContract.end_date,
    contractType: dbContract.contract_type,
    status: dbContract.status,
    monthlyRent: dbContract.monthly_rent,
    gstPercent: dbContract.gst_percent,
    copyLimitA4: dbContract.copy_limit_a4,
    copyLimitA3: dbContract.copy_limit_a3,
    extraA4CopyCharge: dbContract.extra_a4_copy_charge,
    extraA3CopyCharge: dbContract.extra_a3_copy_charge,
    billingCycle: dbContract.billing_cycle,
    notes: dbContract.notes,
    location: dbContract.location,
    department: dbContract.department,
    createdAt: dbContract.created_at
  }),
  
  adaptAMCBilling: (dbBilling: any): AMCBilling => ({
    id: dbBilling.id,
    contractId: dbBilling.contract_id,
    machineId: dbBilling.machine_id,
    customerId: dbBilling.customer_id,
    customerName: dbBilling.customer_name,
    department: dbBilling.department,
    serialNumber: dbBilling.serial_number,
    machineType: dbBilling.machine_type,
    machineModel: dbBilling.machine_model,
    billingMonth: dbBilling.billing_month,
    billDate: dbBilling.bill_date,
    a4OpeningReading: dbBilling.a4_opening_reading,
    a4ClosingReading: dbBilling.a4_closing_reading,
    a4TotalCopies: dbBilling.a4_total_copies,
    a4FreeCopies: dbBilling.a4_free_copies,
    a4ExtraCopies: dbBilling.a4_extra_copies,
    a4ExtraCopyRate: dbBilling.a4_extra_copy_rate,
    a4ExtraCopyCharge: dbBilling.a4_extra_copy_charge,
    a3OpeningReading: dbBilling.a3_opening_reading || 0,
    a3ClosingReading: dbBilling.a3_closing_reading || 0,
    a3TotalCopies: dbBilling.a3_total_copies || 0,
    a3FreeCopies: dbBilling.a3_free_copies || 0,
    a3ExtraCopies: dbBilling.a3_extra_copies || 0,
    a3ExtraCopyRate: dbBilling.a3_extra_copy_rate || 0,
    a3ExtraCopyCharge: dbBilling.a3_extra_copy_charge || 0,
    rent: dbBilling.rent,
    gstPercent: dbBilling.gst_percent,
    gstAmount: dbBilling.gst_amount,
    rentGst: dbBilling.rent_gst,
    totalBill: dbBilling.total_bill,
    billStatus: dbBilling.bill_status,
    invoiceNo: dbBilling.invoice_no,
    createdAt: dbBilling.created_at
  }),
  
  adaptAMCConsumableUsage: (dbUsage: any): AMCConsumableUsage => ({
    id: dbUsage.id,
    contractId: dbUsage.contract_id,
    machineId: dbUsage.machine_id,
    customerId: dbUsage.customer_id,
    customerName: dbUsage.customer_name,
    department: dbUsage.department,
    serialNumber: dbUsage.serial_number,
    machineType: dbUsage.machine_type,
    machineModel: dbUsage.machine_model,
    date: dbUsage.date,
    itemId: dbUsage.item_id,
    itemName: dbUsage.item_name,
    quantity: dbUsage.quantity,
    cost: dbUsage.cost,
    engineerId: dbUsage.engineer_id,
    engineerName: dbUsage.engineer_name,
    inventoryDeducted: dbUsage.inventory_deducted,
    remarks: dbUsage.remarks,
    createdAt: dbUsage.created_at
  })
};
