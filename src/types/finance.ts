
export interface CashEntry {
  id: string;
  date: string;
  amount: number;
  department: string;
  category: string;
  description: string;
  paymentMethod: string;
  enteredBy: string;
  type: 'Income' | 'Expense';
  reference?: string;
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
  status: 'Overdue' | 'Due Soon' | 'Due';
  lastFollowUp?: string;
  notes?: string;
  contactPerson?: string;
  contactNumber?: string;
  priority: 'High' | 'Medium' | 'Low';
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
