
import { supabase } from '@/integrations/supabase/client';
import { ServiceExpense, ExpenseCategory } from '@/types/serviceExpense';

export const fetchServiceExpenses = async (): Promise<ServiceExpense[]> => {
  const { data, error } = await supabase
    .from('service_expenses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching service expenses:", error);
    throw new Error(`Error fetching service expenses: ${error.message}`);
  }
  
  // Transform the raw data into ServiceExpense objects
  const expenses: ServiceExpense[] = (data || []).map(item => ({
    id: item.id,
    serviceCallId: item.service_call_id,
    engineerId: item.engineer_id,
    engineerName: item.engineer_name,
    customerId: item.customer_id,
    customerName: item.customer_name,
    category: item.category as ExpenseCategory,
    amount: item.amount,
    description: item.description,
    date: item.date,
    isReimbursed: item.is_reimbursed,
    receiptImageUrl: item.receipt_image_url,
    createdAt: item.created_at,
    serviceCallInfo: null
  }));
  
  // For expenses tied to service calls, fetch the service call details
  const serviceCallIds = [...new Set(expenses
    .filter(e => e.serviceCallId !== "general" && e.serviceCallId !== null)
    .map(e => e.serviceCallId))];
  
  if (serviceCallIds.length > 0) {
    const { data: serviceCallsData, error: serviceCallsError } = await supabase
      .from('service_calls')
      .select('id, customer_name, customer_id, location, machine_model')
      .in('id', serviceCallIds);
    
    if (serviceCallsError) {
      console.error("Error fetching service call details:", serviceCallsError);
    } else if (serviceCallsData) {
      // Add service call info to the expenses
      const serviceCallMap = new Map();
      serviceCallsData.forEach(call => {
        serviceCallMap.set(call.id, {
          customerName: call.customer_name,
          customerId: call.customer_id,
          location: call.location,
          machineModel: call.machine_model
        });
      });
      
      expenses.forEach(expense => {
        if (expense.serviceCallId !== "general" && serviceCallMap.has(expense.serviceCallId)) {
          expense.serviceCallInfo = serviceCallMap.get(expense.serviceCallId);
        }
      });
    }
  }
  
  console.log("Fetched and transformed service expenses:", expenses);
  return expenses;
};

export const updateExpenseReimbursementStatus = async (expenseId: string, isReimbursed: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('service_expenses')
      .update({ is_reimbursed: isReimbursed })
      .eq('id', expenseId);
    
    if (error) {
      console.error("Error updating expense reimbursement status:", error);
      return false;
    }
    console.log(`Successfully updated expense ${expenseId} reimbursement status to ${isReimbursed}`);
    return true;
  } catch (err) {
    console.error("Exception when updating expense reimbursement status:", err);
    return false;
  }
};

// Function to add service charge (income) to the system
export const addServiceCharge = async (
  customerId: string,
  customerName: string,
  amount: number,
  description: string,
  date: string
): Promise<boolean> => {
  try {
    // For service charges, we record them as "reimbursed" expenses with engineerId="system"
    // This way they appear as income in financial reports
    const { error } = await supabase
      .from('service_expenses')
      .insert({
        service_call_id: "general", // Not tied to a specific call
        engineer_id: "system", // System-generated charge
        engineer_name: "System",
        customer_id: customerId,
        customer_name: customerName,
        category: "Other",
        amount: amount,
        description: description,
        date: date,
        is_reimbursed: true // Marked as reimbursed so it counts as income
      });
    
    if (error) {
      console.error("Error adding service charge:", error);
      return false;
    }
    
    console.log(`Successfully added service charge of ${amount} for customer ${customerName}`);
    return true;
  } catch (err) {
    console.error("Exception when adding service charge:", err);
    return false;
  }
};

// Function to add an expense to the system
export const addServiceExpense = async (expense: ServiceExpense): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('service_expenses')
      .insert({
        service_call_id: expense.serviceCallId,
        engineer_id: expense.engineerId,
        engineer_name: expense.engineerName,
        customer_id: expense.customerId || null,
        customer_name: expense.customerName || null,
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        is_reimbursed: expense.isReimbursed,
        receipt_image_url: expense.receiptImageUrl
      });
    
    if (error) {
      console.error("Error adding service expense:", error);
      return false;
    }
    
    console.log(`Successfully added ${expense.category} expense of ${expense.amount} for ${expense.engineerName}`);
    return true;
  } catch (err) {
    console.error("Exception when adding service expense:", err);
    return false;
  }
};
