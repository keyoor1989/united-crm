export type Brand = {
  id: string;
  name: string;
  createdAt: string;
};

export type Model = {
  id: string;
  brandId: string;
  name: string;
  type: 'Machine' | 'Spare Part';
  createdAt: string;
};

export type ItemType = 'Toner' | 'Drum' | 'Developer' | 'Fuser' | 'Paper Feed' | 'Other';

export type InventoryItem = {
  id: string;
  modelId: string;
  brandId: string;
  name: string;
  type: ItemType;
  minQuantity: number;
  currentQuantity: number;
  lastPurchasePrice: number;
  lastVendor: string;
  barcode: string;
  createdAt: string;
};

export type Warehouse = {
  id: string;
  name: string;
  code: string;
  location: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  isActive: boolean;
  createdAt: string;
};

export type WarehouseStock = {
  id: string;
  warehouseId: string;
  itemId: string;
  quantity: number;
  lastUpdated: string;
};

export type Vendor = {
  id: string;
  name: string;
  gstNo: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  performanceScore?: number; // For vendor performance tracking
  averageDeliveryTime?: number; // In days
  qualityRating?: number; // Out of 5
  reliabilityScore?: number; // Calculated score
};

export type PurchaseEntry = {
  id: string;
  itemId: string;
  quantity: number;
  purchaseRate: number;
  vendorId: string;
  vendorName: string;
  warehouseId: string;  // New field
  warehouseName: string;  // New field
  purchaseDate: string;
  invoiceNo: string;
  barcode: string;
  printBarcode: boolean;
  createdAt: string;
  deliveryDate?: string; // For tracking vendor performance
};

export type IssueType = 'Engineer' | 'Customer' | 'Branch';

export type IssueEntry = {
  id: string;
  itemId: string;
  quantity: number;
  issuedTo: string;
  issueType: IssueType;
  issueDate: string;
  billType: 'GST' | 'Non-GST';
  barcode: string;
  createdAt: string;
  serviceCallId?: string; // For linking to service calls
  machineId?: string; // For machine-wise part tracking
};

export type StockHistory = {
  id: string;
  itemId: string;
  transactionType: 'Purchase' | 'Issue' | 'Return' | 'Transfer';
  quantity: number;
  balanceAfter: number;
  referenceId: string; // ID of purchase or issue entry
  date: string;
  remarks: string;
  createdAt: string;
};

export type Branch = 'Indore (HQ)' | 'Bhopal Office' | 'Jabalpur Office';

export type TransferStatus = 'Requested' | 'Approved' | 'Dispatched' | 'Received' | 'Cancelled';

export type TransferMethod = 'Courier' | 'Hand Delivery' | 'Bus' | 'Railway';

export type StockTransfer = {
  id: string;
  itemId: string;
  quantity: number;
  sourceType: 'Branch' | 'Warehouse';  // New field
  sourceBranch?: Branch;
  sourceWarehouseId?: string;  // New field
  sourceWarehouseName?: string;  // New field
  destinationType: 'Branch' | 'Warehouse';  // New field
  destinationBranch?: Branch;
  destinationWarehouseId?: string;  // New field
  destinationWarehouseName?: string;  // New field
  requestDate: string;
  approvedDate?: string;
  dispatchDate?: string;
  receivedDate?: string;
  status: TransferStatus;
  transferMethod?: TransferMethod;
  trackingNumber?: string;
  remarks?: string;
  requestedBy: string;
  approvedBy?: string;
  createdAt: string;
};

export type ReturnReason = 'Damaged' | 'Excess' | 'Not Used' | 'Defective' | 'Wrong Item';

export type ReturnStatus = 'Pending' | 'Inspected' | 'Restocked' | 'Quarantined' | 'Returned to Vendor';

export type ItemReturn = {
  id: string;
  itemId: string;
  quantity: number;
  returnedBy: string;
  returnType: IssueType; // Who is returning: Engineer, Customer, or Branch
  returnDate: string;
  reason: ReturnReason;
  underWarranty: boolean;
  status: ReturnStatus;
  vendorReturnId?: string; // If returned to vendor
  remarks?: string;
  createdAt: string;
};

export type EngineerInventory = {
  id: string;
  engineerId: string;
  engineerName: string;
  itemId: string;
  itemName: string;
  assignedQuantity: number;
  remainingQuantity: number;
  lastUpdated: string;
  createdAt: string;
};

export type MachinePartUsage = {
  id: string;
  machineId: string;
  customerId: string;
  customerName: string;
  serialNumber: string;
  itemId: string;
  itemName: string;
  quantity: number;
  installedDate: string;
  installedBy: string;
  serviceCallId?: string;
  createdAt: string;
};

export type PartProfitability = {
  id: string;
  itemId: string;
  itemName: string;
  totalPurchased: number;
  totalSold: number;
  avgPurchaseRate: number;
  avgSellingRate: number;
  totalRevenue: number;
  totalCost: number;
  profitMargin: number;
  period: string; // e.g., "Jan 2025", "Q1 2025", "2025"
  createdAt: string;
};

export type AMCConsumable = {
  id: string;
  machineId: string;
  customerId: string;
  customerName: string;
  contractId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  usageDate: string;
  meterReading?: number;
  copyCount?: number;
  billingAmount?: number;
  createdAt: string;
};

export type VendorPerformance = {
  id: string;
  vendorId: string;
  vendorName: string;
  totalOrders: number;
  onTimeDelivery: number; // Number of on-time deliveries
  avgDeliveryTime: number; // In days
  priceConsistency: number; // Score out of 5
  productQuality: number; // Score out of 5
  returnRate: number; // Percentage
  reliabilityScore: number; // Calculated score
  period: string; // e.g., "Jan 2025", "Q1 2025", "2025"
  createdAt: string;
};
