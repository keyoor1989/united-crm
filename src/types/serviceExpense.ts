
export type ExpenseCategory = 'Travel' | 'Food' | 'Accommodation' | 'Fuel' | 'Other';

export interface ServiceCallInfo {
  customerName: string;
  customerId?: string;
  location?: string;
  machineModel?: string;
}

export interface ServiceExpense {
  id: string;
  serviceCallId: string;
  engineerId: string;
  engineerName: string;
  customerId?: string | null;
  customerName?: string | null;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  isReimbursed: boolean;
  receiptImageUrl?: string;
  createdAt: string;
  serviceCallInfo?: ServiceCallInfo | null;
}
