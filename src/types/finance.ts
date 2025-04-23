
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
  entityType: string;
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
