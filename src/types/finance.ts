
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
  narration?: string;  // Add the new narration field
}
