
import { supabase } from '@/integrations/supabase/client';
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from '@/types/sales';
import { dbAdapters } from '@/utils/dbTypeAdapters';

/**
 * Service to handle purchase order operations
 */
const purchaseOrderService = {
  /**
   * Get all purchase orders
   */
  getAllPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data.map(order => ({
        id: order.id,
        poNumber: order.po_number,
        vendorId: order.vendor_id || '',
        vendorName: order.vendor_name,
        items: Array.isArray(order.items) 
          ? (order.items as unknown as PurchaseOrderItem[])
          : JSON.parse(JSON.stringify(order.items || '[]')),
        subtotal: order.subtotal,
        totalGst: order.total_gst,
        grandTotal: order.grand_total,
        createdAt: order.created_at,
        deliveryDate: order.delivery_date || '',
        status: order.status as PurchaseOrderStatus,
        notes: order.notes || '',
        terms: order.terms || ''
      }));
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
  },

  /**
   * Get a purchase order by ID
   */
  getPurchaseOrderById: async (id: string): Promise<PurchaseOrder> => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
        poNumber: data.po_number,
        vendorId: data.vendor_id || '',
        vendorName: data.vendor_name,
        items: Array.isArray(data.items) 
          ? (data.items as unknown as PurchaseOrderItem[])
          : JSON.parse(JSON.stringify(data.items || '[]')),
        subtotal: data.subtotal,
        totalGst: data.total_gst,
        grandTotal: data.grand_total,
        createdAt: data.created_at,
        deliveryDate: data.delivery_date || '',
        status: data.status as PurchaseOrderStatus,
        notes: data.notes || '',
        terms: data.terms || ''
      };
    } catch (error) {
      console.error(`Error fetching purchase order with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new purchase order
   */
  createPurchaseOrder: async (purchaseOrder: Omit<PurchaseOrder, 'id' | 'createdAt'>): Promise<PurchaseOrder> => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert({
          po_number: purchaseOrder.poNumber,
          vendor_id: purchaseOrder.vendorId,
          vendor_name: purchaseOrder.vendorName,
          items: JSON.stringify(purchaseOrder.items), // Convert complex objects to JSON string
          subtotal: purchaseOrder.subtotal,
          total_gst: purchaseOrder.totalGst,
          grand_total: purchaseOrder.grandTotal,
          delivery_date: purchaseOrder.deliveryDate,
          status: purchaseOrder.status,
          notes: purchaseOrder.notes,
          terms: purchaseOrder.terms
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
        poNumber: data.po_number,
        vendorId: data.vendor_id || '',
        vendorName: data.vendor_name,
        items: Array.isArray(data.items) 
          ? (data.items as unknown as PurchaseOrderItem[])
          : JSON.parse(JSON.stringify(data.items || '[]')),
        subtotal: data.subtotal,
        totalGst: data.total_gst,
        grandTotal: data.grand_total,
        createdAt: data.created_at,
        deliveryDate: data.delivery_date || '',
        status: data.status as PurchaseOrderStatus,
        notes: data.notes || '',
        terms: data.terms || ''
      };
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  },

  /**
   * Update an existing purchase order
   */
  updatePurchaseOrder: async (id: string, updates: Partial<PurchaseOrder>): Promise<void> => {
    try {
      const updateData: Record<string, any> = {};
      
      if (updates.poNumber) updateData.po_number = updates.poNumber;
      if (updates.vendorId) updateData.vendor_id = updates.vendorId;
      if (updates.vendorName) updateData.vendor_name = updates.vendorName;
      if (updates.items) updateData.items = JSON.stringify(updates.items);
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
        throw new Error(error.message);
      }
    } catch (error) {
      console.error(`Error updating purchase order with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a purchase order
   */
  deletePurchaseOrder: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error(`Error deleting purchase order with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Generate a unique purchase order number
   */
  generatePurchaseOrderNumber: async (): Promise<string> => {
    try {
      // Get the current date
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      // Query to get the count of POs this month
      const { count, error } = await supabase
        .from('purchase_orders')
        .select('id', { count: 'exact', head: true })
        .like('po_number', `PO-${year}-${month}-%`);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Generate the new number with a sequential counter
      const counter = String((count || 0) + 1).padStart(3, '0');
      return `PO-${year}-${month}-${counter}`;
    } catch (error) {
      console.error('Error generating purchase order number:', error);
      // Fallback to a simple format if generation fails
      const date = new Date();
      return `PO-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    }
  },

  /**
   * Fetch all purchase orders
   */
  fetchPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
    return purchaseOrderService.getAllPurchaseOrders();
  },

  /**
   * Fetch a purchase order by ID
   */
  fetchPurchaseOrderById: async (id: string): Promise<PurchaseOrder> => {
    return purchaseOrderService.getPurchaseOrderById(id);
  }
};

// Export the service and individual methods for convenience
export const { 
  getAllPurchaseOrders, 
  getPurchaseOrderById, 
  createPurchaseOrder, 
  updatePurchaseOrder, 
  deletePurchaseOrder,
  generatePurchaseOrderNumber,
  fetchPurchaseOrders,
  fetchPurchaseOrderById
} = purchaseOrderService;

export { purchaseOrderService };
