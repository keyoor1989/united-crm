
export type Brand = {
  id: string;
  name: string;
  createdAt: string;
};

export type Model = {
  id: string;
  brandId: string;
  name: string;
  type: 'Machine' | 'Spare Part';
  createdAt: string;
};

export type ItemType = 'Toner' | 'Drum' | 'Developer' | 'Fuser' | 'Paper Feed' | 'Other';

export type InventoryItem = {
  id: string;
  modelId: string;
  brandId: string;
  name: string;
  type: ItemType;
  minQuantity: number;
  currentQuantity: number;
  lastPurchasePrice: number;
  lastVendor: string;
  barcode: string;
  createdAt: string;
};

export type PurchaseEntry = {
  id: string;
  itemId: string;
  quantity: number;
  purchaseRate: number;
  vendorName: string;
  purchaseDate: string;
  barcode: string;
  createdAt: string;
};

export type IssueType = 'Engineer' | 'Customer' | 'Branch';

export type IssueEntry = {
  id: string;
  itemId: string;
  quantity: number;
  issuedTo: string;
  issueType: IssueType;
  issueDate: string;
  billType: 'GST' | 'Non-GST';
  barcode: string;
  createdAt: string;
};

export type StockHistory = {
  id: string;
  itemId: string;
  transactionType: 'Purchase' | 'Issue' | 'Return' | 'Transfer';
  quantity: number;
  balanceAfter: number;
  referenceId: string; // ID of purchase or issue entry
  date: string;
  remarks: string;
  createdAt: string;
};
