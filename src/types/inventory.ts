
export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstNo?: string;
  createdAt: string;
}

export interface VendorPerformanceMetric {
  id: string;
  vendorId: string;
  period: string;
  totalOrders: number;
  onTimeDelivery: number;
  avgDeliveryTime: number;
  priceConsistency: number;
  productQuality: number;
  returnRate: number;
  reliabilityScore: number;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  unitCost: number;
  unitPrice: number;
  location: string;
  lastRestocked: string;
  createdAt: string;
}
