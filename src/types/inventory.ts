export type Brand = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Model = {
  id: string;
  brandId: string;
  name: string;
  type: 'Machine' | 'Spare Part';
  createdAt: string;
  updatedAt: string;
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

export type VendorPerformanceMetric = {
  id: string;
  vendorId: string;
  period: string; // e.g., "Q1 2023", "Jan 2023", etc.
  totalOrders: number;
  onTimeDelivery: number; // Number of on-time deliveries
  avgDeliveryTime: number; // In days
  priceConsistency: number; // Score out of 5
  productQuality: number; // Score out of 5
  returnRate: number; // Percentage
  reliabilityScore: number; // Calculated overall score (0-100)
  createdAt: string;
};

export type PurchaseEntry = {
  id: string;
  itemId: string;
  quantity: number;
  purchaseRate: number;
  vendorId: string;
  vendorName: string;
  warehouseId: string;  // Required field for destination warehouse
  warehouseName: string;  // Required field for destination warehouse name
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
  warehouseId?: string; // Source warehouse for the issued item
};

export type StockHistory = {
  id: string;
  itemId: string;
  transactionType: 'Purchase' | 'Issue' | 'Return' | 'Transfer' | 'Sale';
  quantity: number;
  balanceAfter: number;
  referenceId: string; // ID of purchase or issue entry
  date: string;
  remarks: string;
  createdAt: string;
  warehouseId?: string; // Warehouse where the transaction happened
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
  warehouseId?: string; // Destination warehouse for returned item
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
  warehouseId?: string; // Source warehouse from which items were assigned
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
  warehouseId?: string; // Source warehouse from which parts were used
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

// Updated AMC types to match database schema and fix machine_type type issues
export type AMCContract = {
  id: string;
  contract_id?: string; // For compatibility with DB
  customer_id: string;
  customer_name: string;
  machine_model: string;
  machine_type: string; // Changed from "Black & White" | "Color" to string
  serial_number: string;
  contract_type: string; // Changed from "AMC" | "Rental" to string
  start_date: string;
  end_date: string;
  monthly_rent: number;
  gst_percent: number;
  copy_limit_a4: number;
  copy_limit_a3: number;
  extra_a4_copy_charge: number;
  extra_a3_copy_charge: number;
  billing_cycle: string; // Changed from "Monthly" | "Quarterly" | "Yearly" to string
  status: string; // Changed from specific status types to string
  location?: string;
  department?: string;
  notes?: string;
  created_at?: string;
};

export type AMCMachine = {
  id: string;
  contract_id: string;
  customer_id: string;
  customer_name: string;
  model: string;
  machine_type: string; // Changed from "Black & White" | "Color" to string
  serial_number: string;
  location: string;
  department?: string;
  contract_type: string; // Changed from "AMC" | "Rental" to string
  start_date: string;
  end_date: string;
  current_rent: number;
  copy_limit_a4: number;
  copy_limit_a3: number;
  last_a4_reading: number;
  last_a3_reading: number;
  last_reading_date?: string;
  created_at?: string;
};

export type AMCConsumableUsage = {
  id: string;
  contract_id: string;
  machine_id: string;
  customer_id: string;
  customer_name: string;
  machine_model: string;
  machine_type: string; // Changed from "Black & White" | "Color" to string
  serial_number: string;
  engineer_id?: string;
  engineer_name?: string;
  date: string;
  item_id?: string;
  item_name: string;
  quantity: number;
  cost: number;
  inventory_deducted?: boolean;
  department?: string;
  remarks?: string;
  created_at?: string;
};

export type AMCBilling = {
  id: string;
  contract_id: string;
  machine_id: string;
  customer_id: string;
  customer_name: string;
  machine_model: string;
  machine_type: string; // Changed from "Black & White" | "Color" to string
  serial_number: string;
  department?: string;
  billing_month: string;
  a4_opening_reading: number;
  a4_closing_reading: number;
  a4_total_copies: number;
  a4_free_copies: number;
  a4_extra_copies: number;
  a4_extra_copy_rate: number;
  a4_extra_copy_charge: number;
  a3_opening_reading: number;
  a3_closing_reading: number;
  a3_total_copies: number;
  a3_free_copies: number;
  a3_extra_copies: number;
  a3_extra_copy_rate: number;
  a3_extra_copy_charge: number;
  gst_percent: number;
  gst_amount: number;
  rent: number;
  rent_gst: number;
  total_bill: number;
  bill_date: string;
  bill_status: string; // Changed from specific status types to string
  invoice_no?: string;
  created_at?: string;
};

export type AMCProfitReport = {
  id: string;
  contract_id: string;
  machine_id: string;
  customer_id: string;
  customer_name: string;
  machine_model: string;
  machine_type: string; // Changed from "Black & White" | "Color" to string
  serial_number: string;
  department?: string;
  month: string;
  rent_received: number;
  extra_copy_income: number;
  total_income: number;
  consumables_cost: number;
  engineer_visit_cost: number;
  travel_expense: number;
  food_expense: number;
  other_expense: number;
  total_expense: number;
  profit: number;
  profit_margin: number;
  created_at?: string;
};

export type ProfitableMachine = {
  id: string;
  customerName: string;
  machineModel: string;
  serialNumber: string;
  profit: number;
  profitMargin: number;
};

export type CustomerType = 'Regular' | 'Dealer' | 'Government';

export type PaymentStatus = 'Pending' | 'Partial' | 'Completed';

export type PaymentMethod = 'Cash' | 'Online Transfer' | 'Check' | 'Credit Card';

export type TaxType = 'GST' | 'Non-GST';

export type SaleStatus = 'Draft' | 'Confirmed' | 'Delivered' | 'Cancelled';

export type Sale = {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  customerType: CustomerType;
  date: string;
  items: SaleItem[];
  subtotal: number;
  taxAmount: number;
  taxType: TaxType;
  discount: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  amountPaid: number;
  amountDue: number;
  notes?: string;
  status: SaleStatus;
  warehouseId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  stockDeducted: boolean; // New field to track if stock has been deducted
};

export type SaleItem = {
  id: string;
  saleId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  total: number;
};
