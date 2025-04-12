
import { supabase } from "@/integrations/supabase/client";
import { ServiceExpense, ExpenseCategory } from "@/types/serviceExpense";
import { toast } from "@/hooks/use-toast";

export const fetchServiceExpenses = async (): Promise<ServiceExpense[]> => {
  try {
    const { data, error } = await supabase
      .from('service_expenses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching service expenses:", error);
      toast({
        title: "Error",
        description: "Failed to load service expenses",
        variant: "destructive",
      });
      return [];
    }
    
    const serviceExpenses: ServiceExpense[] = data.map(expense => ({
      id: expense.id,
      serviceCallId: expense.service_call_id,
      engineerId: expense.engineer_id,
      engineerName: expense.engineer_name,
      category: expense.category as ExpenseCategory, // Cast to ExpenseCategory type
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
      isReimbursed: expense.is_reimbursed,
      receiptImageUrl: expense.receipt_image_url || undefined,
      createdAt: expense.created_at
    }));
    
    return serviceExpenses;
  } catch (err) {
    console.error("Unexpected error fetching service expenses:", err);
    return [];
  }
};

export const addServiceExpense = async (expense: ServiceExpense): Promise<boolean> => {
  try {
    console.log("Adding service expense:", expense);
    const { error } = await supabase
      .from('service_expenses')
      .insert({
        service_call_id: expense.serviceCallId,
        engineer_id: expense.engineerId,
        engineer_name: expense.engineerName,
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        is_reimbursed: expense.isReimbursed,
        receipt_image_url: expense.receiptImageUrl
      });
    
    if (error) {
      console.error("Error adding service expense:", error);
      toast({
        title: "Error",
        description: "Failed to add service expense",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Unexpected error adding service expense:", err);
    return false;
  }
};

export const updateExpenseReimbursementStatus = async (
  expenseId: string, 
  isReimbursed: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('service_expenses')
      .update({ is_reimbursed: isReimbursed })
      .eq('id', expenseId);
    
    if (error) {
      console.error("Error updating expense reimbursement status:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Unexpected error updating expense reimbursement status:", err);
    return false;
  }
};
