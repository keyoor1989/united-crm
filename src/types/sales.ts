
// Update ProductCategory to be more specific
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

// Update PurchaseOrderStatus to include Cash Purchase
export type PurchaseOrderStatus = 
  "Draft" | 
  "Sent" | 
  "Confirmed" | 
  "Received" | 
  "Cancelled" | 
  "Cash Purchase";
