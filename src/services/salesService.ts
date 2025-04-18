import { supabase } from "@/integrations/supabase/client";
import { SalesItem } from "@/components/inventory/sales/SalesTable";
import { toast } from "sonner";

export type SaleRecord = {
  id: string;
  date: string;
  customer_id?: string;
  customer_name: string;
  customer_type: string;
  status: string;
  payment_status: string;
  payment_method?: string;
  invoice_number?: string | null;
  bill_generated: boolean;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  sales_number?: string;
};

export type SaleItemRecord = {
  id?: string;
  sale_id?: string;
  item_name: string;
  item_id?: string;
  category?: string;
  quantity: number;
  unit_price: number;
  gst_percent?: number;
  gst_amount?: number;
  total: number;
  description?: string;
};

export type PaymentRecord = {
  id?: string;
  sale_id: string;
  payment_date?: string;
  payment_method: string;
  amount: number;
  reference_number?: string;
  notes?: string;
};

export type CreditTermsRecord = {
  id?: string;
  sale_id: string;
  due_date: string;
  credit_limit?: number;
  status: 'Active' | 'Overdue' | 'Paid' | 'Cancelled';
  follow_up_date?: string;
  last_follow_up_notes?: string;
};

// Helper function to get next sales number
async function getNextSalesNumber(): Promise<string> {
  const { data, error } = await supabase
    .rpc('get_next_sales_number');
    
  if (error) {
    console.error('Error getting next sales number:', error);
    // Fallback format if the sequence fails
    return `SALE-${new Date().getTime()}`;
  }
  
  return `SALE-${data.toString().padStart(4, '0')}`;
}

// Fetch all sales
export const fetchSales = async (): Promise<SalesItem[]> => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching sales:', error);
      toast.error('Failed to load sales data');
      return [];
    }
    
    // Transform the data to match our frontend SalesItem format
    const salesData: SalesItem[] = data.map(sale => ({
      id: sale.id,
      date: sale.date,
      customer: sale.customer_name,
      customerType: sale.customer_type,
      itemName: '', // Will be populated from items
      quantity: 0, // Will be populated from items
      unitPrice: 0, // Will be populated from items
      total: sale.total_amount,
      status: sale.status,
      paymentMethod: sale.payment_method || '',
      paymentStatus: sale.payment_status,
      billGenerated: sale.bill_generated,
      invoiceNumber: sale.invoice_number || null
    }));
    
    // Fetch items for each sale to get the first item details
    for (const sale of salesData) {
      const { data: itemsData, error: itemsError } = await supabase
        .from('sales_items')
        .select('*')
        .eq('sale_id', sale.id)
        .order('id', { ascending: true })
        .limit(1);
      
      if (!itemsError && itemsData.length > 0) {
        sale.itemName = itemsData[0].item_name;
        sale.quantity = itemsData[0].quantity;
        sale.unitPrice = itemsData[0].unit_price;
      }
    }
    
    return salesData;
  } catch (error) {
    console.error('Error in fetchSales:', error);
    toast.error('An unexpected error occurred while loading sales data');
    return [];
  }
};

// Add a new sale with items
export const addSale = async (
  saleData: Omit<SaleRecord, 'id' | 'sales_number'>, 
  itemsData: Omit<SaleItemRecord, 'id' | 'sale_id'>[]
): Promise<string | null> => {
  try {
    const salesNumber = await getNextSalesNumber();
    
    // Insert the sale record
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([{ ...saleData, sales_number: salesNumber }])
      .select('id')
      .single();
    
    if (saleError) {
      console.error('Error creating sale:', saleError);
      toast.error('Failed to create sale');
      return null;
    }
    
    // Insert the sale items
    const saleItems = itemsData.map(item => ({
      ...item,
      sale_id: sale.id
    }));
    
    const { error: itemsError } = await supabase
      .from('sales_items')
      .insert(saleItems);
    
    if (itemsError) {
      console.error('Error adding sale items:', itemsError);
      toast.error('Failed to add sale items');
      // Consider rolling back the sale here
      return null;
    }
    
    // For credit sales, add credit terms
    if (saleData.status === 'Credit Sale' && saleData.payment_status === 'Due') {
      // Calculate due date (30 days from now by default)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      const creditTerms: CreditTermsRecord = {
        sale_id: sale.id,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'Active'
      };
      
      const { error: creditError } = await supabase
        .from('credit_terms')
        .insert([creditTerms]);
      
      if (creditError) {
        console.error('Error creating credit terms:', creditError);
        // Not blocking the sale creation
      }
    }
    
    toast.success('Sale recorded successfully');
    return sale.id;
  } catch (error) {
    console.error('Error in addSale:', error);
    toast.error('An unexpected error occurred while creating the sale');
    return null;
  }
};

// Generate bill/invoice for a sale
export const generateBill = async (saleId: string, invoiceNumber: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('sales')
      .update({
        bill_generated: true,
        invoice_number: invoiceNumber
      })
      .eq('id', saleId);
    
    if (error) {
      console.error('Error generating bill:', error);
      toast.error('Failed to generate bill');
      return false;
    }
    
    toast.success('Bill generated successfully');
    return true;
  } catch (error) {
    console.error('Error in generateBill:', error);
    toast.error('An unexpected error occurred while generating the bill');
    return false;
  }
};

// Record payment for a sale
export const recordPayment = async (payment: PaymentRecord): Promise<boolean> => {
  try {
    // Insert the payment record
    const { error: paymentError } = await supabase
      .from('sale_payments')
      .insert([payment]);
    
    if (paymentError) {
      console.error('Error recording payment:', paymentError);
      toast.error('Failed to record payment');
      return false;
    }
    
    // Get the total payments for this sale
    const { data: payments, error: paymentsError } = await supabase
      .from('sale_payments')
      .select('amount')
      .eq('sale_id', payment.sale_id);
    
    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return true; // Payment recorded, but status update failed
    }
    
    // Get the sale total amount
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select('total_amount')
      .eq('id', payment.sale_id)
      .single();
    
    if (saleError) {
      console.error('Error fetching sale:', saleError);
      return true; // Payment recorded, but status update failed
    }
    
    // Calculate total paid amount
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    // Update the payment status based on the paid amount
    let paymentStatus = 'Pending';
    if (totalPaid >= sale.total_amount) {
      paymentStatus = 'Paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'Partial';
    }
    
    // Update the sale payment status
    const { error: updateError } = await supabase
      .from('sales')
      .update({ payment_status: paymentStatus, payment_method: payment.payment_method })
      .eq('id', payment.sale_id);
    
    if (updateError) {
      console.error('Error updating payment status:', updateError);
      return true; // Payment recorded, but status update failed
    }
    
    // Update credit terms if this is a credit sale
    if (paymentStatus === 'Paid') {
      const { error: creditError } = await supabase
        .from('credit_terms')
        .update({ status: 'Paid' })
        .eq('sale_id', payment.sale_id);
      
      if (creditError) {
        console.error('Error updating credit terms:', creditError);
      }
    }
    
    toast.success('Payment recorded successfully');
    return true;
  } catch (error) {
    console.error('Error in recordPayment:', error);
    toast.error('An unexpected error occurred while recording payment');
    return false;
  }
};

// Get sale details with items
export const getSaleDetails = async (saleId: string): Promise<{sale: SaleRecord, items: SaleItemRecord[]} | null> => {
  try {
    // Get the sale
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select('*')
      .eq('id', saleId)
      .single();
    
    if (saleError) {
      console.error('Error fetching sale details:', saleError);
      toast.error('Failed to load sale details');
      return null;
    }
    
    // Get the sale items
    const { data: items, error: itemsError } = await supabase
      .from('sales_items')
      .select('*')
      .eq('sale_id', saleId);
    
    if (itemsError) {
      console.error('Error fetching sale items:', itemsError);
      toast.error('Failed to load sale items');
      return null;
    }
    
    return { sale, items };
  } catch (error) {
    console.error('Error in getSaleDetails:', error);
    toast.error('An unexpected error occurred while loading sale details');
    return null;
  }
};

// Get credit sales
export const getCreditSales = async (): Promise<SalesItem[]> => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('status', 'Credit Sale')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching credit sales:', error);
      toast.error('Failed to load credit sales data');
      return [];
    }
    
    // Transform the data to match our frontend SalesItem format
    const salesData: SalesItem[] = data.map(sale => ({
      id: sale.id,
      date: sale.date,
      customer: sale.customer_name,
      customerType: sale.customer_type,
      itemName: '', // Will be populated from items
      quantity: 0, // Will be populated from items
      unitPrice: 0, // Will be populated from items
      total: sale.total_amount,
      status: sale.status,
      paymentMethod: sale.payment_method || '',
      paymentStatus: sale.payment_status,
      billGenerated: sale.bill_generated,
      invoiceNumber: sale.invoice_number || null
    }));
    
    // Fetch items for each sale to get the first item details
    for (const sale of salesData) {
      const { data: itemsData, error: itemsError } = await supabase
        .from('sales_items')
        .select('*')
        .eq('sale_id', sale.id)
        .order('id', { ascending: true })
        .limit(1);
      
      if (!itemsError && itemsData.length > 0) {
        sale.itemName = itemsData[0].item_name;
        sale.quantity = itemsData[0].quantity;
        sale.unitPrice = itemsData[0].unit_price;
      }
      
      // Get due date for credit sales
      const { data: creditData, error: creditError } = await supabase
        .from('credit_terms')
        .select('due_date')
        .eq('sale_id', sale.id)
        .single();
      
      if (!creditError && creditData) {
        sale.dueDate = creditData.due_date;
      }
    }
    
    return salesData;
  } catch (error) {
    console.error('Error in getCreditSales:', error);
    toast.error('An unexpected error occurred while loading credit sales data');
    return [];
  }
};

// Fetch sales data for reports with date range filtering
export const fetchSalesReportData = async (fromDate: Date, toDate: Date): Promise<SalesItem[]> => {
  try {
    // Format dates to ISO strings
    const fromDateStr = fromDate.toISOString();
    const toDateStr = toDate.toISOString();
    
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .gte('date', fromDateStr)
      .lte('date', toDateStr)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching sales report data:', error);
      toast.error('Failed to load sales report data');
      return [];
    }
    
    // Transform the data to match our frontend SalesItem format
    const salesData: SalesItem[] = data.map(sale => ({
      id: sale.id,
      date: sale.date,
      customer: sale.customer_name,
      customerType: sale.customer_type,
      itemName: '', // Will be populated from items
      quantity: 0, // Will be populated from items
      unitPrice: 0, // Will be populated from items
      total: sale.total_amount,
      status: sale.status,
      paymentMethod: sale.payment_method || '',
      paymentStatus: sale.payment_status,
      billGenerated: sale.bill_generated,
      invoiceNumber: sale.invoice_number || null
    }));
    
    // Fetch items for each sale to get the first item details
    for (const sale of salesData) {
      const { data: itemsData, error: itemsError } = await supabase
        .from('sales_items')
        .select('*')
        .eq('sale_id', sale.id)
        .order('id', { ascending: true })
        .limit(1);
      
      if (!itemsError && itemsData.length > 0) {
        sale.itemName = itemsData[0].item_name;
        sale.quantity = itemsData[0].quantity;
        sale.unitPrice = itemsData[0].unit_price;
      }
    }
    
    return salesData;
  } catch (error) {
    console.error('Error in fetchSalesReportData:', error);
    toast.error('An unexpected error occurred while loading sales report data');
    return [];
  }
};
