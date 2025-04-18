
import { supabase } from "@/integrations/supabase/client";
import { SalesItem } from "@/components/inventory/sales/SalesTable";
import { toast } from "sonner";
import { ShipmentDetails } from "@/types/shipment";

// Helper function to get next sales number
async function getNextSalesNumber(): Promise<string> {
  try {
    // Use a direct SQL query instead of RPC function
    const { data, error } = await supabase
      .from('sales')
      .select('sales_number')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    // If there are existing sales, generate the next number
    if (data && data.length > 0 && data[0].sales_number) {
      const lastSaleNumber = data[0].sales_number;
      const lastNumber = parseInt(lastSaleNumber.split('-')[1]);
      const nextNumber = lastNumber + 1;
      return `SALE-${nextNumber.toString().padStart(4, '0')}`;
    }
    
    // For the first sale ever
    return 'SALE-0001';
  } catch (error) {
    console.error('Error getting next sales number:', error);
    // Fallback format if the query fails
    return `SALE-${new Date().getTime()}`;
  }
}

// Fetch all sales
export const fetchSales = async (): Promise<SalesItem[]> => {
  try {
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select(`
        *,
        sales_items (
          item_name,
          quantity,
          unit_price,
          total
        ),
        shipment_details (
          shipment_method,
          courier_name,
          tracking_number,
          bus_details,
          train_details,
          additional_details,
          status
        )
      `);

    if (salesError) {
      console.error("Error fetching sales:", salesError);
      throw salesError;
    }

    // Map the data to the SalesItem type
    const salesItems: SalesItem[] = salesData.map((sale) => ({
      id: sale.id,
      date: sale.date,
      customer: sale.customer_name,
      customerType: sale.customer_type,
      itemName: sale.sales_items?.[0]?.item_name || 'N/A',
      quantity: sale.sales_items?.[0]?.quantity || 0,
      unitPrice: sale.sales_items?.[0]?.unit_price || 0,
      total: sale.total_amount,
      status: sale.status,
      paymentMethod: sale.payment_method,
      paymentStatus: sale.payment_status,
      billGenerated: sale.bill_generated,
      invoiceNumber: sale.invoice_number,
      dueDate: sale.due_date,
      createdBy: sale.created_by,
      shipmentMethod: sale.shipment_details?.[0]?.shipment_method || null,
      shipmentDetails: sale.shipment_details?.[0] || null
    }));

    return salesItems;
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw error;
  }
};

// Fetch credit sales only
export const getCreditSales = async (): Promise<SalesItem[]> => {
  try {
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select(`
        *,
        sales_items (
          item_name,
          quantity,
          unit_price,
          total
        ),
        credit_terms (
          due_date,
          status
        ),
        shipment_details (
          shipment_method,
          courier_name,
          tracking_number,
          bus_details,
          train_details,
          additional_details,
          status
        )
      `)
      .eq('payment_status', 'Due');

    if (salesError) {
      console.error("Error fetching credit sales:", salesError);
      throw salesError;
    }

    // Map the data to the SalesItem type
    const salesItems: SalesItem[] = salesData.map((sale) => ({
      id: sale.id,
      date: sale.date,
      customer: sale.customer_name,
      customerType: sale.customer_type,
      itemName: sale.sales_items?.[0]?.item_name || 'N/A',
      quantity: sale.sales_items?.[0]?.quantity || 0,
      unitPrice: sale.sales_items?.[0]?.unit_price || 0,
      total: sale.total_amount,
      status: sale.status,
      paymentMethod: sale.payment_method,
      paymentStatus: sale.payment_status,
      billGenerated: sale.bill_generated,
      invoiceNumber: sale.invoice_number,
      dueDate: sale.credit_terms?.[0]?.due_date || sale.due_date,
      createdBy: sale.created_by,
      shipmentMethod: sale.shipment_details?.[0]?.shipment_method || null,
      shipmentDetails: sale.shipment_details?.[0] || null
    }));

    return salesItems;
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
        total_amount: sale.total_amount,
        due_date: sale.due_date,
        sales_type: sale.sales_type || 'direct',
        payment_terms: sale.payment_terms,
        gst_number: sale.gst_number,
        shipping_address: sale.shipping_address,
        billing_address: sale.billing_address,
        created_by: sale.created_by || 'Admin', // Default to Admin if not provided
        notes: sale.notes
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating sale:', error);
      throw new Error(error.message);
    }
    
    // Create sale items
    if (data && saleItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('sales_items')
        .insert(saleItems.map(item => ({
          sale_id: data.id,
          item_id: item.item_id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          category: item.category,
          description: item.description,
          gst_percent: item.gst_percent || 0,
          gst_amount: item.gst_amount || 0
        })));
          
      if (itemsError) {
        console.error('Error creating sale items:', itemsError);
        // Continue anyway to at least record the sale
      }
    }

    // If it's a credit sale, create credit terms
    if (sale.payment_status === 'Due' && sale.due_date) {
      const { error: creditError } = await supabase
        .from('credit_terms')
        .insert({
          sale_id: data.id,
          due_date: sale.due_date,
          credit_limit: sale.credit_limit,
          status: 'Active'
        });

      if (creditError) {
        console.error('Error creating credit terms:', creditError);
      }
    }
    
    // If shipment details are provided, create shipment record
    if (sale.shipment_method) {
      const { error: shipmentError } = await supabase
        .from('shipment_details')
        .insert({
          sale_id: data.id,
          shipment_method: sale.shipment_method,
          courier_name: sale.courier_name,
          tracking_number: sale.tracking_number,
          bus_details: sale.bus_details,
          train_details: sale.train_details,
          additional_details: sale.additional_details,
          status: 'Pending'
        });

      if (shipmentError) {
        console.error('Error creating shipment details:', shipmentError);
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
      .from('sale_payments')
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

// Update shipment details
export const updateShipmentDetails = async (saleId: string, shipmentData: ShipmentDetails): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('shipment_details')
      .upsert({
        sale_id: saleId,
        shipment_method: shipmentData.shipment_method,
        courier_name: shipmentData.courier_name,
        tracking_number: shipmentData.tracking_number,
        bus_details: shipmentData.bus_details,
        train_details: shipmentData.train_details,
        additional_details: shipmentData.additional_details,
        status: 'Pending'
      });

    if (error) {
      console.error("Error updating shipment details:", error);
      toast.error("Failed to update shipment details");
      return false;
    }

    toast.success("Shipment details updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating shipment details:", error);
    toast.error("Failed to update shipment details");
    return false;
  }
};

// Fetch sales data for reports with date filtering
export const fetchSalesReportData = async (startDate: Date, endDate: Date): Promise<SalesItem[]> => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        shipment_details (
          shipment_method,
          courier_name,
          tracking_number,
          bus_details,
          train_details,
          additional_details,
          status
        )
      `)
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
      dueDate: sale.due_date,
      createdBy: sale.created_by,
      shipmentMethod: sale.shipment_details?.[0]?.shipment_method || null,
      shipmentDetails: sale.shipment_details?.[0] || null
    }));

    return salesData;
  } catch (error) {
    console.error("Error fetching sales report data:", error);
    throw error;
  }
};
