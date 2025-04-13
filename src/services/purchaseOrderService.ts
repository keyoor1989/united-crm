
import { supabase } from '@/integrations/supabase/client';
import { PurchaseOrder, PurchaseOrderStatus } from '@/types/sales';
import { v4 as uuidv4 } from 'uuid';

// Type for JSON serialization
type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// Fetch all purchase orders
export const fetchPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching purchase orders:', error);
    throw error;
  }

  // Convert from DB format to our app's format
  return data.map((order: any) => ({
    id: order.id,
    poNumber: order.po_number,
    vendorId: order.vendor_id || '',
    vendorName: order.vendor_name,
    items: Array.isArray(order.items) ? order.items : [],
    subtotal: order.subtotal,
    totalGst: order.total_gst,
    grandTotal: order.grand_total,
    createdAt: order.created_at,
    deliveryDate: order.delivery_date,
    status: order.status as PurchaseOrderStatus,
    notes: order.notes || '',
    terms: order.terms || '',
  }));
};

// Fetch a specific purchase order by ID
export const fetchPurchaseOrderById = async (id: string): Promise<PurchaseOrder | null> => {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No order found
    }
    console.error('Error fetching purchase order:', error);
    throw error;
  }

  // Convert from DB format to our app's format
  return {
    id: data.id,
    poNumber: data.po_number,
    vendorId: data.vendor_id || '',
    vendorName: data.vendor_name,
    items: Array.isArray(data.items) ? data.items : [],
    subtotal: data.subtotal,
    totalGst: data.total_gst,
    grandTotal: data.grand_total,
    createdAt: data.created_at,
    deliveryDate: data.delivery_date,
    status: data.status as PurchaseOrderStatus,
    notes: data.notes || '',
    terms: data.terms || '',
  };
};

// Create a new purchase order
export const createPurchaseOrder = async (order: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> => {
  // Convert from our app's format to DB format
  const dbOrder = {
    po_number: order.poNumber,
    vendor_id: order.vendorId,
    vendor_name: order.vendorName,
    items: order.items, // JSON serialization happens automatically
    subtotal: order.subtotal,
    total_gst: order.totalGst,
    grand_total: order.grandTotal,
    created_at: order.createdAt,
    delivery_date: order.deliveryDate,
    status: order.status,
    notes: order.notes,
    terms: order.terms,
  };

  const { data, error } = await supabase
    .from('purchase_orders')
    .insert(dbOrder)
    .select()
    .single();

  if (error) {
    console.error('Error creating purchase order:', error);
    throw error;
  }

  // Convert from DB format to our app's format
  return {
    id: data.id,
    poNumber: data.po_number,
    vendorId: data.vendor_id || '',
    vendorName: data.vendor_name,
    items: Array.isArray(data.items) ? data.items : [],
    subtotal: data.subtotal,
    totalGst: data.total_gst,
    grandTotal: data.grand_total,
    createdAt: data.created_at,
    deliveryDate: data.delivery_date,
    status: data.status as PurchaseOrderStatus,
    notes: data.notes || '',
    terms: data.terms || '',
  };
};

// Update an existing purchase order
export const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
  // Convert from our app's format to DB format
  const dbUpdates: any = {};
  
  if (updates.poNumber !== undefined) dbUpdates.po_number = updates.poNumber;
  if (updates.vendorId !== undefined) dbUpdates.vendor_id = updates.vendorId;
  if (updates.vendorName !== undefined) dbUpdates.vendor_name = updates.vendorName;
  if (updates.items !== undefined) dbUpdates.items = updates.items;
  if (updates.subtotal !== undefined) dbUpdates.subtotal = updates.subtotal;
  if (updates.totalGst !== undefined) dbUpdates.total_gst = updates.totalGst;
  if (updates.grandTotal !== undefined) dbUpdates.grand_total = updates.grandTotal;
  if (updates.createdAt !== undefined) dbUpdates.created_at = updates.createdAt;
  if (updates.deliveryDate !== undefined) dbUpdates.delivery_date = updates.deliveryDate;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.terms !== undefined) dbUpdates.terms = updates.terms;

  const { data, error } = await supabase
    .from('purchase_orders')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating purchase order:', error);
    throw error;
  }

  // Convert from DB format to our app's format
  return {
    id: data.id,
    poNumber: data.po_number,
    vendorId: data.vendor_id || '',
    vendorName: data.vendor_name,
    items: Array.isArray(data.items) ? data.items : [],
    subtotal: data.subtotal,
    totalGst: data.total_gst,
    grandTotal: data.grand_total,
    createdAt: data.created_at,
    deliveryDate: data.delivery_date,
    status: data.status as PurchaseOrderStatus,
    notes: data.notes || '',
    terms: data.terms || '',
  };
};

// Delete a purchase order
export const deletePurchaseOrder = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('purchase_orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting purchase order:', error);
    throw error;
  }

  return true;
};

// Generate a purchase order number
export const generatePurchaseOrderNumber = async (): Promise<string> => {
  const prefix = 'PO';
  const year = new Date().getFullYear().toString();
  
  // Get the latest purchase order to determine the next number
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('po_number')
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (error) {
    console.error('Error generating PO number:', error);
    // Fallback to random number generation
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}-${randomNum}`;
  }
  
  if (data && data.length > 0) {
    const lastPO = data[0].po_number;
    // Try to extract the last number and increment
    const match = lastPO.match(/(\d+)$/);
    if (match) {
      const lastNum = parseInt(match[1]);
      const nextNum = (lastNum + 1).toString().padStart(3, '0');
      return `${prefix}-${year}-${nextNum}`;
    }
  }
  
  // Default if no previous PO or pattern doesn't match
  return `${prefix}-${year}-001`;
};
