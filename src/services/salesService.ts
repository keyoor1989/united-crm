
import { supabase } from "@/integrations/supabase/client";
import { SalesItem } from "@/components/inventory/sales/SalesTable";
import { toast } from "sonner";

// Helper function to get next sales number
async function getNextSalesNumber(): Promise<string> {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get_next_sales_number`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get next sales number');
    }
    
    const number = await response.json();
    return `SALE-${number.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error getting next sales number:', error);
    // Fallback format if the function fails
    return `SALE-${new Date().getTime()}`;
  }
}

// Fetch all sales
export const fetchSales = async (): Promise<SalesItem[]> => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*');

    if (error) {
      console.error("Error fetching sales:", error);
      throw error;
    }

    // Map the data to the SalesItem type
    const salesData: SalesItem[] = data.map((sale) => ({
      id: sale.id,
      date: sale.date,
      customer: sale.customer_name,
      customerType: sale.customer_type,
      itemName: 'Sample Item', // Assuming item_name is stored elsewhere
      quantity: 1, // Assuming quantity is stored elsewhere
      unitPrice: 100, // Default value
      total: sale.total_amount,
      status: sale.status,
      paymentMethod: sale.payment_method,
      paymentStatus: sale.payment_status,
      billGenerated: sale.bill_generated,
      invoiceNumber: sale.invoice_number,
      // The due_date property doesn't exist in the sales table, so we'll set it to null
      dueDate: null
    }));

    return salesData;
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw error;
  }
};

// Fetch credit sales only
export const getCreditSales = async (): Promise<SalesItem[]> => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('payment_status', 'Due');

    if (error) {
      console.error("Error fetching credit sales:", error);
      throw error;
    }

    // Map the data to the SalesItem type
    const salesData: SalesItem[] = data.map((sale) => ({
      id: sale.id,
      date: sale.date,
      customer: sale.customer_name,
      customerType: sale.customer_type,
      itemName: 'Sample Item', // Assuming item_name is stored elsewhere
      quantity: 1, // Assuming quantity is stored elsewhere
      unitPrice: 100, // Default value
      total: sale.total_amount,
      status: sale.status,
      paymentMethod: sale.payment_method,
      paymentStatus: sale.payment_status,
      billGenerated: sale.bill_generated,
      invoiceNumber: sale.invoice_number,
      // The due_date property doesn't exist in the sales table, so we'll set it to null
      dueDate: null
    }));

    return salesData;
  } catch (error) {
    console.error("Error fetching credit sales:", error);
    throw error;
  }
};

// Add a new sale
export async function addSale(sale: any, saleItems: any[] = []): Promise<string | null> {
  try {
    // Get the next sales number
    const salesNumber = await getNextSalesNumber();
    
    // Create the sale record
    const { data, error } = await supabase
      .from('sales')
      .insert({
        sales_number: salesNumber,
        date: new Date().toISOString(),
        customer_name: sale.customer_name,
        customer_type: sale.customer_type,
        payment_method: sale.payment_method,
        payment_status: sale.payment_status,
        status: sale.status,
        bill_generated: sale.bill_generated,
        invoice_number: sale.invoice_number,
        subtotal: sale.subtotal,
        tax_amount: sale.tax_amount || 0,
        total_amount: sale.total_amount
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating sale:', error);
      throw new Error(error.message);
    }
    
    // Create sale items
    if (data && saleItems.length > 0) {
      for (const item of saleItems) {
        const { error: itemError } = await supabase
          .from('sales_items') // Changed from 'sale_items' to 'sales_items'
          .insert({
            sale_id: data.id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total
          });
          
        if (itemError) {
          console.error('Error creating sale item:', itemError);
          // Continue anyway to at least record the other items
        }
      }
    }
    
    toast.success(`Sale #${salesNumber} recorded successfully`);
    return data.id;
  } catch (error) {
    console.error('Error in addSale:', error);
    toast.error('Failed to record sale');
    return null;
  }
}

// Generate bill
export const generateBill = async (saleId: string, invoiceNumber: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('sales')
      .update({ bill_generated: true, invoice_number: invoiceNumber })
      .eq('id', saleId);

    if (error) {
      console.error("Error generating bill:", error);
      toast.error("Failed to generate bill");
      return false;
    }

    toast.success("Bill generated successfully");
    return true;
  } catch (error) {
    console.error("Error generating bill:", error);
    toast.error("Failed to generate bill");
    return false;
  }
};

// Record payment
export const recordPayment = async (payment: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('sale_payments') // Changed from 'payments' to 'sale_payments'
      .insert(payment);

    if (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment");
      return false;
    }

    // Update the payment status of the sale
    const { error: saleError } = await supabase
      .from('sales')
      .update({ payment_status: 'Paid' })
      .eq('id', payment.sale_id);

    if (saleError) {
      console.error("Error updating sale payment status:", saleError);
      toast.error("Payment recorded, but failed to update sale status");
      return false;
    }

    toast.success("Payment recorded successfully");
    return true;
  } catch (error) {
    console.error("Error recording payment:", error);
    toast.error("Failed to record payment");
    return false;
  }
};

// Fetch sales data for reports with date filtering
export const fetchSalesReportData = async (startDate: Date, endDate: Date): Promise<SalesItem[]> => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());

    if (error) {
      console.error("Error fetching sales report data:", error);
      throw error;
    }

    // Map the data to the SalesItem type
    const salesData: SalesItem[] = data.map((sale) => ({
      id: sale.id,
      date: sale.date,
      customer: sale.customer_name,
      customerType: sale.customer_type,
      itemName: 'Sample Item', // This will be updated once we implement full item details
      quantity: 1, 
      unitPrice: 100, // Default value since unit_price is not in the sales table
      total: sale.total_amount,
      status: sale.status,
      paymentMethod: sale.payment_method,
      paymentStatus: sale.payment_status,
      billGenerated: sale.bill_generated,
      invoiceNumber: sale.invoice_number,
      // The due_date property doesn't exist in the sales table, so we'll set it to null
      dueDate: null
    }));

    return salesData;
  } catch (error) {
    console.error("Error fetching sales report data:", error);
    throw error;
  }
};
