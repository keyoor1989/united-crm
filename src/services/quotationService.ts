
import { supabase } from '@/integrations/supabase/client';
import { Quotation, QuotationStatus } from '@/types/sales';

/**
 * Fetches all quotations from the database
 */
export const fetchQuotations = async (): Promise<Quotation[]> => {
  try {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform database records to match our Quotation type
    const quotations: Quotation[] = data.map(record => ({
      id: record.id,
      quotationNumber: record.quotation_number,
      customerId: record.customer_id || '',
      customerName: record.customer_name,
      items: typeof record.items === 'string' 
        ? JSON.parse(record.items) 
        : (Array.isArray(record.items) ? record.items : []),
      subtotal: record.subtotal,
      totalGst: record.total_gst,
      grandTotal: record.grand_total,
      createdAt: record.created_at,
      validUntil: record.valid_until || '',
      status: record.status as QuotationStatus,
      notes: record.notes || '',
      terms: record.terms || ''
    }));

    return quotations;
  } catch (error) {
    console.error('Error fetching quotations:', error);
    throw error;
  }
};

/**
 * Fetches a specific quotation by ID
 */
export const fetchQuotationById = async (id: string): Promise<Quotation | null> => {
  try {
    console.log("Fetching quotation by ID:", id);
    
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        console.log("No quotation found with ID:", id);
        return null;
      }
      console.error("Supabase error fetching quotation:", error);
      throw error;
    }

    if (!data) {
      console.log("No data returned for quotation ID:", id);
      return null;
    }

    console.log("Raw quotation data from DB:", data);
    console.log("Items type:", typeof data.items);
    
    // Check if items is a string and parse it if necessary
    let parsedItems;
    try {
      parsedItems = typeof data.items === 'string' 
        ? JSON.parse(data.items) 
        : (Array.isArray(data.items) ? data.items : []);
        
      // Verify it's an array after parsing
      if (!Array.isArray(parsedItems)) {
        console.error('Items is not an array after parsing:', parsedItems);
        parsedItems = [];
      } else {
        console.log("Successfully parsed items array with length:", parsedItems.length);
      }
    } catch (parseError) {
      console.error('Error parsing items JSON:', parseError);
      console.log('Original items value:', data.items);
      parsedItems = [];
    }

    // Transform database record to match our Quotation type
    const quotation: Quotation = {
      id: data.id,
      quotationNumber: data.quotation_number,
      customerId: data.customer_id || '',
      customerName: data.customer_name,
      items: parsedItems,
      subtotal: data.subtotal,
      totalGst: data.total_gst,
      grandTotal: data.grand_total,
      createdAt: data.created_at,
      validUntil: data.valid_until || '',
      status: data.status as QuotationStatus,
      notes: data.notes || '',
      terms: data.terms || ''
    };

    console.log("Processed quotation object:", {
      id: quotation.id,
      quotationNumber: quotation.quotationNumber,
      itemsType: typeof quotation.items,
      itemsIsArray: Array.isArray(quotation.items),
      itemsLength: Array.isArray(quotation.items) ? quotation.items.length : 'not an array'
    });

    return quotation;
  } catch (error) {
    console.error('Error fetching quotation:', error);
    throw error;
  }
};

/**
 * Creates a new quotation
 */
export const createQuotation = async (quotation: Omit<Quotation, 'id'>): Promise<Quotation> => {
  try {
    const { data, error } = await supabase
      .from('quotations')
      .insert({
        quotation_number: quotation.quotationNumber,
        customer_id: quotation.customerId,
        customer_name: quotation.customerName,
        items: JSON.stringify(quotation.items), // Convert QuotationItem[] to JSON
        subtotal: quotation.subtotal,
        total_gst: quotation.totalGst,
        grand_total: quotation.grandTotal,
        created_at: quotation.createdAt,
        valid_until: quotation.validUntil,
        status: quotation.status,
        notes: quotation.notes,
        terms: quotation.terms
      })
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('No data returned from insert operation');
    }

    // Transform database record to match our Quotation type
    const newQuotation: Quotation = {
      id: data[0].id,
      quotationNumber: data[0].quotation_number,
      customerId: data[0].customer_id || '',
      customerName: data[0].customer_name,
      items: JSON.parse(JSON.stringify(data[0].items)), // Convert JSON to QuotationItem[]
      subtotal: data[0].subtotal,
      totalGst: data[0].total_gst,
      grandTotal: data[0].grand_total,
      createdAt: data[0].created_at,
      validUntil: data[0].valid_until || '',
      status: data[0].status as QuotationStatus,
      notes: data[0].notes || '',
      terms: data[0].terms || ''
    };

    return newQuotation;
  } catch (error) {
    console.error('Error creating quotation:', error);
    throw error;
  }
};

/**
 * Updates an existing quotation
 */
export const updateQuotation = async (id: string, updates: Partial<Quotation>): Promise<void> => {
  try {
    // Prepare update object converting from camelCase to snake_case
    const updateData: any = {};
    
    if (updates.quotationNumber) updateData.quotation_number = updates.quotationNumber;
    if (updates.customerId) updateData.customer_id = updates.customerId;
    if (updates.customerName) updateData.customer_name = updates.customerName;
    if (updates.items) updateData.items = JSON.stringify(updates.items); // Convert QuotationItem[] to JSON
    if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal;
    if (updates.totalGst !== undefined) updateData.total_gst = updates.totalGst;
    if (updates.grandTotal !== undefined) updateData.grand_total = updates.grandTotal;
    if (updates.validUntil) updateData.valid_until = updates.validUntil;
    if (updates.status) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.terms !== undefined) updateData.terms = updates.terms;

    const { error } = await supabase
      .from('quotations')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating quotation:', error);
    throw error;
  }
};

/**
 * Deletes a quotation
 */
export const deleteQuotation = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting quotation:', error);
    throw error;
  }
};
