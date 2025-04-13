
import { supabase } from '@/integrations/supabase/client';
import { Quotation, QuotationStatus } from '@/types/sales';
import { v4 as uuidv4 } from 'uuid';

// Type for JSON serialization
type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// Fetch all quotations
export const fetchQuotations = async (): Promise<Quotation[]> => {
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quotations:', error);
    throw error;
  }

  // Convert from DB format to our app's format
  return data.map((quotation: any) => ({
    id: quotation.id,
    quotationNumber: quotation.quotation_number,
    customerId: quotation.customer_id || '',
    customerName: quotation.customer_name,
    items: Array.isArray(quotation.items) ? quotation.items : [],
    subtotal: quotation.subtotal,
    totalGst: quotation.total_gst,
    grandTotal: quotation.grand_total,
    createdAt: quotation.created_at,
    validUntil: quotation.valid_until,
    status: quotation.status as QuotationStatus,
    notes: quotation.notes || '',
    terms: quotation.terms || '',
  }));
};

// Fetch a specific quotation by ID
export const fetchQuotationById = async (id: string): Promise<Quotation | null> => {
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No quotation found
    }
    console.error('Error fetching quotation:', error);
    throw error;
  }

  // Convert from DB format to our app's format
  return {
    id: data.id,
    quotationNumber: data.quotation_number,
    customerId: data.customer_id || '',
    customerName: data.customer_name,
    items: Array.isArray(data.items) ? data.items : [],
    subtotal: data.subtotal,
    totalGst: data.total_gst,
    grandTotal: data.grand_total,
    createdAt: data.created_at,
    validUntil: data.valid_until,
    status: data.status as QuotationStatus,
    notes: data.notes || '',
    terms: data.terms || '',
  };
};

// Create a new quotation
export const createQuotation = async (quotation: Omit<Quotation, 'id'>): Promise<Quotation> => {
  // Convert from our app's format to DB format
  const dbQuotation = {
    quotation_number: quotation.quotationNumber,
    customer_id: quotation.customerId,
    customer_name: quotation.customerName,
    items: quotation.items, // JSON serialization happens automatically
    subtotal: quotation.subtotal,
    total_gst: quotation.totalGst,
    grand_total: quotation.grandTotal,
    created_at: quotation.createdAt,
    valid_until: quotation.validUntil,
    status: quotation.status,
    notes: quotation.notes,
    terms: quotation.terms,
  };

  const { data, error } = await supabase
    .from('quotations')
    .insert(dbQuotation)
    .select()
    .single();

  if (error) {
    console.error('Error creating quotation:', error);
    throw error;
  }

  // Convert from DB format to our app's format
  return {
    id: data.id,
    quotationNumber: data.quotation_number,
    customerId: data.customer_id || '',
    customerName: data.customer_name,
    items: Array.isArray(data.items) ? data.items : [],
    subtotal: data.subtotal,
    totalGst: data.total_gst,
    grandTotal: data.grand_total,
    createdAt: data.created_at,
    validUntil: data.valid_until,
    status: data.status as QuotationStatus,
    notes: data.notes || '',
    terms: data.terms || '',
  };
};

// Update an existing quotation
export const updateQuotation = async (id: string, updates: Partial<Quotation>): Promise<Quotation> => {
  // Convert from our app's format to DB format
  const dbUpdates: any = {};
  
  if (updates.quotationNumber !== undefined) dbUpdates.quotation_number = updates.quotationNumber;
  if (updates.customerId !== undefined) dbUpdates.customer_id = updates.customerId;
  if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
  if (updates.items !== undefined) dbUpdates.items = updates.items;
  if (updates.subtotal !== undefined) dbUpdates.subtotal = updates.subtotal;
  if (updates.totalGst !== undefined) dbUpdates.total_gst = updates.totalGst;
  if (updates.grandTotal !== undefined) dbUpdates.grand_total = updates.grandTotal;
  if (updates.createdAt !== undefined) dbUpdates.created_at = updates.createdAt;
  if (updates.validUntil !== undefined) dbUpdates.valid_until = updates.validUntil;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.terms !== undefined) dbUpdates.terms = updates.terms;

  const { data, error } = await supabase
    .from('quotations')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating quotation:', error);
    throw error;
  }

  // Convert from DB format to our app's format
  return {
    id: data.id,
    quotationNumber: data.quotation_number,
    customerId: data.customer_id || '',
    customerName: data.customer_name,
    items: Array.isArray(data.items) ? data.items : [],
    subtotal: data.subtotal,
    totalGst: data.total_gst,
    grandTotal: data.grand_total,
    createdAt: data.created_at,
    validUntil: data.valid_until,
    status: data.status as QuotationStatus,
    notes: data.notes || '',
    terms: data.terms || '',
  };
};

// Delete a quotation
export const deleteQuotation = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('quotations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting quotation:', error);
    throw error;
  }

  return true;
};

// Generate a quotation number
export const generateQuotationNumber = async (): Promise<string> => {
  const prefix = 'QT';
  const year = new Date().getFullYear().toString();
  
  // Get the latest quotation to determine the next number
  const { data, error } = await supabase
    .from('quotations')
    .select('quotation_number')
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (error) {
    console.error('Error generating quotation number:', error);
    // Fallback to random number generation
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}-${randomNum}`;
  }
  
  if (data && data.length > 0) {
    const lastQuotation = data[0].quotation_number;
    // Try to extract the last number and increment
    const match = lastQuotation.match(/(\d+)$/);
    if (match) {
      const lastNum = parseInt(match[1]);
      const nextNum = (lastNum + 1).toString().padStart(3, '0');
      return `${prefix}-${year}-${nextNum}`;
    }
  }
  
  // Default if no previous quotation or pattern doesn't match
  return `${prefix}-${year}-001`;
};
