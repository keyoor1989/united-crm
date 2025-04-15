
// Product and inventory types
export type ProductCategory = 
  | "Copier" 
  | "Printer" 
  | "Finishing Machine" 
  | "Toner" 
  | "Drum Unit" 
  | "Machine Parts" 
  | "Lamination Machine" 
  | "Badge Making Machine" 
  | "Other";

export type ProductStatus = "Active" | "Discontinued" | "Out of Stock" | "Low Stock";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description?: string;
  sku?: string;
  brand?: string;
  model?: string;
  unitPrice: number;
  costPrice?: number;
  stock?: number;
  minStock?: number;
  image?: string;
  specifications?: ProductSpecs;
  status: ProductStatus;
  createdAt: string;
}

export interface ProductSpecs {
  [key: string]: string | number | boolean;
}

// Quotation types
export type QuotationStatus = "Draft" | "Sent" | "Approved" | "Rejected" | "Expired";

export interface QuotationItem {
  id: string;
  productId: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  date: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  notes?: string;
  terms?: string;
  status: QuotationStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Purchase Order types
export type PurchaseOrderStatus = 
  "Draft" | 
  "Sent" | 
  "Confirmed" | 
  "Received" | 
  "Cancelled" | 
  "Cash Purchase";

export interface PurchaseOrderItem {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  tax?: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorAddress?: string;
  date: string;
  deliveryDate: string;
  items: PurchaseOrderItem[] | string; // Can be string when stored as JSON
  subtotal: number;
  totalGst: number;
  grandTotal: number;
  notes?: string;
  terms?: string;
  status: PurchaseOrderStatus;
  paymentStatus?: string;
  paymentMethod?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Vendor types (duplicate of what's in inventory.ts but needed for sales components)
export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNo?: string;
  category?: string;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
  createdAt: string;
}
