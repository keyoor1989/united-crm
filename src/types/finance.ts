
export interface CashEntry {
  id: string;
  date: string;
  amount: number;
  department: string;
  category: string;
  description: string;
  payment_method: string;
  entered_by: string;
  type: 'Income' | 'Expense';
  reference?: string;
  branch?: string;
  po_number?: string;
  invoice_number?: string;
  created_at?: string;
  narration?: string;
}

// Dashboard summary types
export interface DepartmentSummary {
  name: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface FinanceSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashInHand: number;
  pendingReceivables: number;
  upcomingPayments: number;
}

export interface FinanceTrend {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

// Revenue types
export interface Revenue {
  id: string;
  date: string;
  department: string;
  category: string;
  amount: number;
  description?: string;
  customer?: string;
  invoiceNumber?: string;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  paymentMethod?: string;
}

// Expense types
export interface Expense {
  id: string;
  date: string;
  department: string;
  category: string;
  amount: number;
  description?: string;
  vendor?: string;
  billNumber?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  approvedBy?: string;
}

// Payment types
export interface Payment {
  id: string;
  date: string;
  entityType: string; // "Customer", "Dealer", or "Rental"
  entityName: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  description?: string;
  invoiceNumbers?: string[];
  receivedBy?: string;
}

// Receivable types
export interface Receivable {
  id: string;
  invoiceNumber: string;
  customer: string;
  date: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  balance: number;
  status: string;
  lastFollowUp?: string;
  notes?: string;
  contactPerson?: string;
  contactNumber?: string;
  priority: 'Low' | 'Medium' | 'High';
  // Adding missing properties that are used in OutstandingReceivables.tsx
  paymentMode?: string;
  department?: string;
  branch?: string;
  paymentMethod?: string;
}

// Rental machine specific types
export interface RentalMachine {
  id: string;
  serialNumber: string;
  model: string;
  clientName: string;
  clientId: string;
  location: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  copyLimitA4: number; 
  copyLimitA3: number;
  extraCopyChargeA4: number;
  extraCopyChargeA3: number;
  currentA4Reading: number;
  currentA3Reading: number;
  lastReadingDate: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  notes?: string;
}

export interface RentalBilling {
  id: string;
  machineId: string;
  billingMonth: string;
  billingDate: string;
  a4Reading: number;
  a4Copies: number;
  a4Limit: number;
  a4Extra: number;
  a4ExtraCharge: number;
  a3Reading: number;
  a3Copies: number;
  a3Limit: number;
  a3Extra: number;
  a3ExtraCharge: number;
  baseRent: number;
  totalCharges: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  invoiceNumber?: string;
}

export interface RentalPartsUsage {
  id: string;
  machineId: string;
  date: string;
  partId: string;
  partName: string;
  quantity: number;
  cost: number;
  replacedAt: number; // Reading when part was replaced
  expectedLifespan: number; // Expected copies before next replacement
  technicianName: string;
  notes?: string;
}
