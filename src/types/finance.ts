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
}

export interface Revenue {
  id: string;
  date: string;
  department: string;
  category: string;
  amount: number;
  description: string;
  customer?: string;
  invoiceNumber?: string;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  paymentMethod?: string;
  revenueType?: string;
  gstPercentage?: number;
  totalWithGst?: number;
  branch?: string;
  paymentMode?: string;
}

export interface Expense {
  id: string;
  date: string;
  department: string;
  category: string;
  amount: number;
  description: string;
  vendor?: string;
  billNumber?: string;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  paymentMethod?: string;
  approvedBy?: string;
  gstPercentage?: number;
  totalWithGst?: number;
  branch?: string;
  notes?: string;
  billFile?: any;
}

export interface Payment {
  id: string;
  date: string;
  entityType: 'Customer' | 'Dealer';
  entityName: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  description: string;
  invoiceNumbers?: string[];
  receivedBy: string;
  branch?: string;
}

export interface Receivable {
  id: string;
  invoiceNumber: string;
  customer: string;
  date: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  balance: number;
  status: 'Overdue' | 'Due Soon' | 'Due' | 'Cleared';
  lastFollowUp?: string;
  notes?: string;
  contactPerson?: string;
  contactNumber?: string;
  priority: 'High' | 'Medium' | 'Low';
  paymentMode?: string;
  department?: string;
  branch?: string;
}

// For the Finance Dashboard
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

// New interface for Branch-wise Profit and Loss Report
export interface BranchFinanceSummary {
  branch: string;
  revenue: {
    machine: number;
    spare: number;
    service: number;
    rental: number;
    total: number;
  };
  expenses: {
    machine: number;
    spare: number;
    service: number;
    rental: number;
    total: number;
  };
  netProfit: number;
  profitMargin: number;
  machinesSold: number;
  serviceCalls: number;
  rentalContracts: number;
}
