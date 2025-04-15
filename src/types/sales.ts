
export type ProductCategory = "Copier" | "Printer" | "Finishing Machine" | "Other";

export type ProductStatus = "Active" | "Discontinued" | "Coming Soon";

export interface ProductSpecs {
  speed?: string;
  color: boolean;
  ram?: string;
  paperTray?: string;
  duplex: boolean;
  additionalSpecs?: { [key: string]: string };
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  specs: ProductSpecs;
  defaultGstPercent: number;
  status: ProductStatus;
  isInventoryItem: boolean;
}

export interface QuotationItem {
  id: string;
  productId: string;
  name: string;
  description: string;
  category: ProductCategory;
  specs: ProductSpecs;
  quantity: number;
  unitPrice: number;
  gstPercent: number;
  gstAmount: number;
  total: number;
  isCustomItem: boolean;
}

export type QuotationStatus = "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  items: QuotationItem[];
  subtotal: number;
  totalGst: number;
  grandTotal: number;
  createdAt: string;
  validUntil: string;
  status: QuotationStatus;
  notes: string;
  terms: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  name: string;
  description: string;
  category: ProductCategory;
  specs: ProductSpecs;
  quantity: number;
  unitPrice: number;
  gstPercent: number;
  gstAmount: number;
  total: number;
  isCustomItem: boolean;
}

export type PurchaseOrderStatus = "Draft" | "Sent" | "Confirmed" | "Received" | "Cancelled" | "Cash Purchase";

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  totalGst: number;
  grandTotal: number;
  createdAt: string;
  deliveryDate: string;
  status: PurchaseOrderStatus;
  notes: string;
  terms: string;
}
