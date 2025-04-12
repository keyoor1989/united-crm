
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
    .filter(e => e.serviceCallId !== null && e.serviceCallId !== undefined && e.serviceCallId !== '00000000-0000-0000-0000-000000000000')
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
        if (expense.serviceCallId && serviceCallMap.has(expense.serviceCallId)) {
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
    // Generate a placeholder UUID for service_call_id instead of using null
    // to satisfy the not-null constraint
    const placeholderServiceCallId = '00000000-0000-0000-0000-000000000000';
    
    // For service charges, we record them as "reimbursed" expenses with engineerId="system"
    // This way they appear as income in financial reports
    console.log("Adding service charge with data:", {
      service_call_id: placeholderServiceCallId,
      customer_id: customerId,
      customer_name: customerName,
      amount,
      description,
      date
    });
    
    const { data, error } = await supabase
      .from('service_expenses')
      .insert({
        service_call_id: placeholderServiceCallId, // Use a placeholder UUID instead of null
        engineer_id: "system", // System-generated charge
        engineer_name: "System",
        customer_id: customerId,
        customer_name: customerName,
        category: "Other",
        amount: amount,
        description: description,
        date: date,
        is_reimbursed: true // Marked as reimbursed so it counts as income
      })
      .select();
    
    if (error) {
      console.error("Error adding service charge:", error);
      return false;
    }
    
    console.log(`Successfully added service charge of ${amount} for customer ${customerName}`, data);
    return true;
  } catch (err) {
    console.error("Exception when adding service charge:", err);
    return false;
  }
};

// Function to add an expense to the system
export const addServiceExpense = async (expense: ServiceExpense): Promise<boolean> => {
  try {
    // Use a placeholder UUID instead of "general" or null for service_call_id
    const serviceCallId = expense.serviceCallId === "general" || !expense.serviceCallId 
      ? '00000000-0000-0000-0000-000000000000' 
      : expense.serviceCallId;
    
    console.log("Adding service expense with data:", {
      ...expense,
      service_call_id: serviceCallId
    });
    
    const { data, error } = await supabase
      .from('service_expenses')
      .insert({
        service_call_id: serviceCallId,
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
      })
      .select();
    
    if (error) {
      console.error("Error adding service expense:", error);
      return false;
    }
    
    console.log(`Successfully added ${expense.category} expense of ${expense.amount} for ${expense.engineerName}`, data);
    return true;
  } catch (err) {
    console.error("Exception when adding service expense:", err);
    return false;
  }
};
