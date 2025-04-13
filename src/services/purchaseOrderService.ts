
import { supabase } from '@/integrations/supabase/client';
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from '@/types/sales';
import { Json } from '@/integrations/supabase/types';

/**
 * Generate a unique purchase order number
 */
export const generatePurchaseOrderNumber = async (): Promise<string> => {
  const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const { count, error } = await supabase
    .from('purchase_orders')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error getting count of purchase orders:', error);
    throw error;
  }

  // Add 1 to current count and pad it to 4 digits
  const counter = (count !== null ? count + 1 : 1).toString().padStart(4, '0');
  return `PO-${datePrefix}-${counter}`;
};

/**
 * Fetches all purchase orders from the database
 */
export const fetchPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform database records to match our PurchaseOrder type
    const purchaseOrders: PurchaseOrder[] = data.map(record => ({
      id: record.id,
      poNumber: record.po_number,
      vendorId: record.vendor_id || '',
      vendorName: record.vendor_name,
      items: record.items as PurchaseOrderItem[],
      subtotal: record.subtotal,
      totalGst: record.total_gst,
      grandTotal: record.grand_total,
      createdAt: record.created_at,
      deliveryDate: record.delivery_date || '',
      status: record.status as PurchaseOrderStatus,
      notes: record.notes || '',
      terms: record.terms || ''
    }));

    return purchaseOrders;
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    throw error;
  }
};

/**
 * Fetches a specific purchase order by ID
 */
export const fetchPurchaseOrderById = async (id: string): Promise<PurchaseOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        return null;
      }
      throw error;
    }

    if (!data) {
      return null;
    }

    // Transform database record to match our PurchaseOrder type
    const purchaseOrder: PurchaseOrder = {
      id: data.id,
      poNumber: data.po_number,
      vendorId: data.vendor_id || '',
      vendorName: data.vendor_name,
      items: JSON.parse(JSON.stringify(data.items)), // Convert JSON to PurchaseOrderItem[]
      subtotal: data.subtotal,
      totalGst: data.total_gst,
      grandTotal: data.grand_total,
      createdAt: data.created_at,
      deliveryDate: data.delivery_date || '',
      status: data.status as PurchaseOrderStatus,
      notes: data.notes || '',
      terms: data.terms || ''
    };

    return purchaseOrder;
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    throw error;
  }
};

/**
 * Creates a new purchase order
 */
export const createPurchaseOrder = async (purchaseOrder: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> => {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert({
        po_number: purchaseOrder.poNumber,
        vendor_id: purchaseOrder.vendorId,
        vendor_name: purchaseOrder.vendorName,
        items: JSON.stringify(purchaseOrder.items), // Convert PurchaseOrderItem[] to JSON
        subtotal: purchaseOrder.subtotal,
        total_gst: purchaseOrder.totalGst,
        grand_total: purchaseOrder.grandTotal,
        created_at: purchaseOrder.createdAt,
        delivery_date: purchaseOrder.deliveryDate,
        status: purchaseOrder.status,
        notes: purchaseOrder.notes,
        terms: purchaseOrder.terms
      })
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('No data returned from insert operation');
    }

    // Transform database record to match our PurchaseOrder type
    const newPurchaseOrder: PurchaseOrder = {
      id: data[0].id,
      poNumber: data[0].po_number,
      vendorId: data[0].vendor_id || '',
      vendorName: data[0].vendor_name,
      items: JSON.parse(JSON.stringify(data[0].items)), // Convert JSON to PurchaseOrderItem[]
      subtotal: data[0].subtotal,
      totalGst: data[0].total_gst,
      grandTotal: data[0].grand_total,
      createdAt: data[0].created_at,
      deliveryDate: data[0].delivery_date || '',
      status: data[0].status as PurchaseOrderStatus,
      notes: data[0].notes || '',
      terms: data[0].terms || ''
    };

    return newPurchaseOrder;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    throw error;
  }
};

/**
 * Updates an existing purchase order
 */
export const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>): Promise<void> => {
  try {
    // Prepare update object converting from camelCase to snake_case
    const updateData: any = {};
    
    if (updates.poNumber) updateData.po_number = updates.poNumber;
    if (updates.vendorId) updateData.vendor_id = updates.vendorId;
    if (updates.vendorName) updateData.vendor_name = updates.vendorName;
    if (updates.items) updateData.items = JSON.stringify(updates.items); // Convert PurchaseOrderItem[] to JSON
    if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal;
    if (updates.totalGst !== undefined) updateData.total_gst = updates.totalGst;
    if (updates.grandTotal !== undefined) updateData.grand_total = updates.grandTotal;
    if (updates.deliveryDate) updateData.delivery_date = updates.deliveryDate;
    if (updates.status) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.terms !== undefined) updateData.terms = updates.terms;

    const { error } = await supabase
      .from('purchase_orders')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating purchase order:', error);
    throw error;
  }
};

/**
 * Deletes a purchase order
 */
export const deletePurchaseOrder = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    throw error;
  }
};
