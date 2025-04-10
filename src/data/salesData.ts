
import { Product, Quotation, PurchaseOrder, Vendor } from "@/types/sales";
import { v4 as uuidv4 } from 'uuid';

// Sample Products
export const products: Product[] = [
  {
    id: "p1",
    name: "Kyocera 2554ci",
    category: "Copier",
    specs: {
      speed: "25 ppm",
      color: true,
      ram: "4 GB",
      paperTray: "2 x 500 Sheets",
      duplex: true,
      additionalSpecs: {
        hdd: "320 GB",
        processor: "1.2 GHz Quad Core"
      }
    },
    defaultGstPercent: 18,
    status: "Active",
    isInventoryItem: true
  },
  {
    id: "p2",
    name: "Canon iR C3530",
    category: "Copier",
    specs: {
      speed: "30 ppm",
      color: true,
      ram: "3 GB",
      paperTray: "2 x 550 Sheets",
      duplex: true,
      additionalSpecs: {
        hdd: "250 GB",
        processor: "1.75 GHz Dual Core"
      }
    },
    defaultGstPercent: 18,
    status: "Active",
    isInventoryItem: true
  },
  {
    id: "p3",
    name: "HP LaserJet Pro M428",
    category: "Printer",
    specs: {
      speed: "40 ppm",
      color: false,
      ram: "512 MB",
      paperTray: "1 x 250 Sheets",
      duplex: true
    },
    defaultGstPercent: 18,
    status: "Active",
    isInventoryItem: true
  },
  {
    id: "p4",
    name: "Konica Minolta C250i",
    category: "Copier",
    specs: {
      speed: "25 ppm",
      color: true,
      ram: "8 GB",
      paperTray: "2 x 500 Sheets",
      duplex: true,
      additionalSpecs: {
        hdd: "256 GB SSD",
        processor: "1.6 GHz Quad Core"
      }
    },
    defaultGstPercent: 18,
    status: "Active",
    isInventoryItem: true
  },
  {
    id: "p5",
    name: "Epson WorkForce Pro WF-C579R",
    category: "Printer",
    specs: {
      speed: "34 ppm",
      color: true,
      ram: "2 GB",
      paperTray: "500 Sheets",
      duplex: true
    },
    defaultGstPercent: 18,
    status: "Active",
    isInventoryItem: true
  },
  {
    id: "p6",
    name: "Duplo DC-616 Pro",
    category: "Finishing Machine",
    specs: {
      speed: "10 sheets/min",
      color: false,
      duplex: false,
      additionalSpecs: {
        cuts: "6 slitter + 25 cross cuts",
        process: "Automated"
      }
    },
    defaultGstPercent: 18,
    status: "Active",
    isInventoryItem: true
  }
];

// Sample Vendors
export const vendors: Vendor[] = [
  {
    id: "v1",
    name: "Kyocera Document Solutions",
    contactPerson: "John Smith",
    email: "john.smith@kyocera.com",
    phone: "123-456-7890",
    address: "123 Kyocera Way, Business District"
  },
  {
    id: "v2",
    name: "Canon Business Solutions",
    contactPerson: "Emily Johnson",
    email: "emily.johnson@canon.com",
    phone: "234-567-8901",
    address: "456 Canon Road, Tech Park"
  },
  {
    id: "v3",
    name: "HP Enterprise",
    contactPerson: "Michael Brown",
    email: "michael.brown@hp.com",
    phone: "345-678-9012",
    address: "789 HP Avenue, Innovation Square"
  },
  {
    id: "v4",
    name: "Konica Minolta Business Solutions",
    contactPerson: "Sarah Wilson",
    email: "sarah.wilson@konicaminolta.com",
    phone: "456-789-0123",
    address: "321 Konica Street, Business Center"
  }
];

// Sample Quotations
export const quotations: Quotation[] = [
  {
    id: "q1",
    quotationNumber: "Q-2023-001",
    customerId: "c1",
    customerName: "ABC Corporation",
    items: [
      {
        id: "qi1",
        productId: "p1",
        name: "Kyocera 2554ci",
        description: "Color Multifunctional Printer",
        category: "Copier",
        specs: {
          speed: "25 ppm",
          color: true,
          ram: "4 GB",
          paperTray: "2 x 500 Sheets",
          duplex: true
        },
        quantity: 2,
        unitPrice: 4500,
        gstPercent: 18,
        gstAmount: 1620,
        total: 10620,
        isCustomItem: false
      },
      {
        id: "qi2",
        productId: "",
        name: "Annual Maintenance Contract",
        description: "Comprehensive AMC for all office equipment",
        category: "Other",
        specs: {
          color: false,
          duplex: false
        },
        quantity: 1,
        unitPrice: 2000,
        gstPercent: 18,
        gstAmount: 360,
        total: 2360,
        isCustomItem: true
      }
    ],
    subtotal: 11000,
    totalGst: 1980,
    grandTotal: 12980,
    createdAt: "2023-04-15",
    validUntil: "2023-05-15",
    status: "Sent",
    notes: "Please review and confirm at your earliest convenience.",
    terms: "Payment due within 30 days of acceptance. Delivery within 2 weeks."
  }
];

// Sample Purchase Orders
export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "po1",
    poNumber: "PO-2023-001",
    vendorId: "v1",
    vendorName: "Kyocera Document Solutions",
    items: [
      {
        id: "poi1",
        productId: "p1",
        name: "Kyocera 2554ci",
        description: "Color Multifunctional Printer",
        category: "Copier",
        specs: {
          speed: "25 ppm",
          color: true,
          ram: "4 GB",
          paperTray: "2 x 500 Sheets",
          duplex: true
        },
        quantity: 3,
        unitPrice: 3800,
        gstPercent: 18,
        gstAmount: 2052,
        total: 13452,
        isCustomItem: false
      }
    ],
    subtotal: 11400,
    totalGst: 2052,
    grandTotal: 13452,
    createdAt: "2023-04-20",
    deliveryDate: "2023-05-10",
    status: "Sent",
    notes: "Please confirm receipt of this purchase order.",
    terms: "Payment will be processed upon delivery and inspection."
  }
];

// Helper function to generate a new quotation number
export const generateQuotationNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `Q-${year}${month}-${randomDigits}`;
};

// Helper function to generate a new purchase order number
export const generatePurchaseOrderNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PO-${year}${month}-${randomDigits}`;
};

// Helper function to calculate GST amount
export const calculateGstAmount = (unitPrice: number, quantity: number, gstPercent: number): number => {
  return (unitPrice * quantity * gstPercent) / 100;
};

// Helper function to create a new quotation item
export const createQuotationItem = (
  product: Product | null,
  quantity: number = 1,
  unitPrice: number = 0,
  isCustomItem: boolean = false,
  customName: string = "",
  customDescription: string = "",
  customCategory: ProductCategory = "Other"
): QuotationItem => {
  const name = isCustomItem ? customName : (product?.name || "");
  const description = isCustomItem ? customDescription : `${product?.category || ""} ${product?.name || ""}`;
  const category = isCustomItem ? customCategory : (product?.category || "Other");
  const gstPercent = product?.defaultGstPercent || 18;
  
  const itemTotal = unitPrice * quantity;
  const gstAmount = calculateGstAmount(unitPrice, quantity, gstPercent);
  
  return {
    id: uuidv4(),
    productId: isCustomItem ? "" : (product?.id || ""),
    name,
    description,
    category,
    specs: isCustomItem 
      ? { color: false, duplex: false } 
      : (product?.specs || { color: false, duplex: false }),
    quantity,
    unitPrice,
    gstPercent,
    gstAmount,
    total: itemTotal + gstAmount,
    isCustomItem
  };
};

// Helper function to create a new purchase order item
export const createPurchaseOrderItem = (
  product: Product | null,
  quantity: number = 1,
  unitPrice: number = 0,
  isCustomItem: boolean = false,
  customName: string = "",
  customDescription: string = "",
  customCategory: ProductCategory = "Other"
): PurchaseOrderItem => {
  const name = isCustomItem ? customName : (product?.name || "");
  const description = isCustomItem ? customDescription : `${product?.category || ""} ${product?.name || ""}`;
  const category = isCustomItem ? customCategory : (product?.category || "Other");
  const gstPercent = product?.defaultGstPercent || 18;
  
  const itemTotal = unitPrice * quantity;
  const gstAmount = calculateGstAmount(unitPrice, quantity, gstPercent);
  
  return {
    id: uuidv4(),
    productId: isCustomItem ? "" : (product?.id || ""),
    name,
    description,
    category,
    specs: isCustomItem 
      ? { color: false, duplex: false } 
      : (product?.specs || { color: false, duplex: false }),
    quantity,
    unitPrice,
    gstPercent,
    gstAmount,
    total: itemTotal + gstAmount,
    isCustomItem
  };
};
