import { v4 as uuidv4 } from 'uuid';
import { 
  Product, 
  ProductCategory, 
  Quotation, 
  QuotationItem, 
  PurchaseOrder, 
  PurchaseOrderItem,
  Vendor
} from '@/types/sales';

// Sample Products
export const products: Product[] = [
  {
    id: "p1",
    name: "TASKalfa 2554ci",
    category: "Copier",
    specs: {
      speed: "25 ppm",
      color: true,
      ram: "4 GB",
      paperTray: "2 x 500 sheets",
      duplex: true,
      additionalSpecs: {
        "HDD": "320 GB",
        "Network": "Standard",
        "Scan Speed": "80 ipm"
      }
    },
    defaultGstPercent: 18,
    status: "Active",
    isInventoryItem: true,
    unitPrice: 165000,
    createdAt: "2023-01-15"
  },
  {
    id: "p2",
    name: "ECOSYS P6235cdn",
    category: "Printer",
    specs: {
      speed: "35 ppm",
      color: true,
      ram: "1 GB",
      paperTray: "500 sheets",
      duplex: true,
      additionalSpecs: {
        "Network": "Standard",
        "Resolution": "1200 dpi"
      }
    },
    defaultGstPercent: 18,
    status: "Active",
    isInventoryItem: true,
    unitPrice: 65000,
    createdAt: "2023-02-20"
  },
  {
    id: "p3",
    name: "DF-7110",
    category: "Finishing Machine",
    specs: {
      color: false,
      duplex: false,
      additionalSpecs: {
        "Capacity": "4000 sheets",
        "Stapling": "65 sheets",
        "Compatibility": "TASKalfa series"
      }
    },
    defaultGstPercent: 18,
    status: "Active",
    isInventoryItem: true,
    unitPrice: 75000,
    createdAt: "2023-03-10"
  },
  {
    id: "p4",
    name: "TASKalfa 3554ci",
    category: "Copier",
    specs: {
      speed: "35 ppm",
      color: true,
      ram: "4 GB",
      paperTray: "2 x 500 sheets",
      duplex: true,
      additionalSpecs: {
        "HDD": "320 GB",
        "Network": "Standard",
        "Scan Speed": "100 ipm"
      }
    },
    defaultGstPercent: 18,
    status: "Active",
    isInventoryItem: true,
    unitPrice: 220000,
    createdAt: "2023-04-05"
  },
  {
    id: "p5",
    name: "ECOSYS M6235cidn",
    category: "Printer",
    specs: {
      speed: "35 ppm",
      color: true,
      ram: "1 GB",
      paperTray: "500 sheets",
      duplex: true,
      additionalSpecs: {
        "Fax": "Standard",
        "Network": "Standard"
      }
    },
    defaultGstPercent: 18,
    status: "Active",
    isInventoryItem: true,
    unitPrice: 65000,
    createdAt: "2023-05-12"
  },
  {
    id: "p6",
    name: "TASKalfa 7353ci",
    category: "Copier",
    specs: {
      speed: "70 ppm",
      color: true,
      ram: "4.5 GB",
      paperTray: "4 x 500 sheets",
      duplex: true,
      additionalSpecs: {
        "HDD": "320 GB SSD",
        "Network": "Standard",
        "Scan Speed": "220 ipm"
      }
    },
    defaultGstPercent: 18,
    status: "Coming Soon",
    isInventoryItem: true,
    unitPrice: 350000,
    createdAt: "2023-06-20"
  }
];

// Sample Vendors
export const vendors: Vendor[] = [
  {
    id: "v1",
    name: "Kyocera Document Solutions",
    contactPerson: "Rahul Sharma",
    email: "rahul.sharma@kyocera.com",
    phone: "9876543210",
    address: "123 Corporate Park, Mumbai, MH 400001",
    createdAt: "2023-01-10"
  },
  {
    id: "v2",
    name: "Canon India",
    contactPerson: "Priya Patel",
    email: "priya.patel@canon.com",
    phone: "9876543211",
    address: "456 Tech Hub, Bangalore, KA 560001",
    createdAt: "2023-02-15"
  },
  {
    id: "v3",
    name: "HP India",
    contactPerson: "Arjun Singh",
    email: "arjun.singh@hp.com",
    phone: "9876543212",
    address: "789 Business Center, Delhi, DL 110001",
    createdAt: "2023-03-20"
  }
];

// Sample Quotations
export const quotations: Quotation[] = [
  {
    id: "q1",
    quotationNumber: "QT-2023-001",
    customerId: "c1",
    customerName: "ABC Technologies",
    items: [
      {
        id: "qi1",
        productId: "p1",
        name: "TASKalfa 2554ci",
        description: "Color Multifunctional Printer",
        category: "Copier",
        specs: {
          speed: "25 ppm",
          color: true,
          ram: "4 GB",
          paperTray: "2 x 500 sheets",
          duplex: true,
          additionalSpecs: {
            "HDD": "320 GB",
            "Network": "Standard"
          }
        },
        quantity: 2,
        unitPrice: 165000,
        gstPercent: 18,
        gstAmount: 59400,
        total: 389400,
        isCustomItem: false
      },
      {
        id: "qi2",
        productId: "p3",
        name: "DF-7110",
        description: "Document Finisher for TASKalfa",
        category: "Finishing Machine",
        specs: {
          color: false,
          duplex: false,
          additionalSpecs: {
            "Capacity": "4000 sheets",
            "Stapling": "65 sheets"
          }
        },
        quantity: 1,
        unitPrice: 75000,
        gstPercent: 18,
        gstAmount: 13500,
        total: 88500,
        isCustomItem: false
      }
    ],
    subtotal: 405000,
    totalGst: 72900,
    grandTotal: 477900,
    createdAt: "2023-10-12",
    validUntil: "2023-11-12",
    status: "Accepted",
    notes: "Thank you for your business.",
    terms: "Payment due within 30 days. Delivery within 2 weeks."
  },
  {
    id: "q2",
    quotationNumber: "QT-2023-002",
    customerId: "c2",
    customerName: "XYZ Corporation",
    items: [
      {
        id: "qi3",
        productId: "p4",
        name: "TASKalfa 3554ci",
        description: "Color Multifunctional Printer",
        category: "Copier",
        specs: {
          speed: "35 ppm",
          color: true,
          ram: "4 GB",
          paperTray: "2 x 500 sheets",
          duplex: true,
          additionalSpecs: {
            "HDD": "320 GB",
            "Network": "Standard"
          }
        },
        quantity: 1,
        unitPrice: 220000,
        gstPercent: 18,
        gstAmount: 39600,
        total: 259600,
        isCustomItem: false
      }
    ],
    subtotal: 220000,
    totalGst: 39600,
    grandTotal: 259600,
    createdAt: "2023-11-05",
    validUntil: "2023-12-05",
    status: "Sent",
    notes: "As discussed, this machine will be placed at your Andheri office.",
    terms: "Payment due within 30 days. Delivery within 2 weeks."
  },
  {
    id: "q3",
    quotationNumber: "QT-2023-003",
    customerId: "c3",
    customerName: "Global Solutions Ltd",
    items: [
      {
        id: "qi4",
        productId: "p5",
        name: "ECOSYS M6235cidn",
        description: "Color Multifunctional Printer",
        category: "Printer",
        specs: {
          speed: "35 ppm",
          color: true,
          ram: "1 GB",
          paperTray: "500 sheets",
          duplex: true,
          additionalSpecs: {
            "Fax": "Standard",
            "Network": "Standard"
          }
        },
        quantity: 5,
        unitPrice: 65000,
        gstPercent: 18,
        gstAmount: 58500,
        total: 383500,
        isCustomItem: false
      },
      {
        id: "qi5",
        productId: "",
        name: "AMC Contract",
        description: "Annual Maintenance Contract for 5 printers",
        category: "Other",
        specs: {
          color: false,
          duplex: false
        },
        quantity: 1,
        unitPrice: 50000,
        gstPercent: 18,
        gstAmount: 9000,
        total: 59000,
        isCustomItem: true
      }
    ],
    subtotal: 375000,
    totalGst: 67500,
    grandTotal: 442500,
    createdAt: "2023-11-15",
    validUntil: "2023-12-15",
    status: "Draft",
    notes: "This includes AMC for a period of 1 year.",
    terms: "Payment due within 30 days. Delivery within 2 weeks."
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
        name: "TASKalfa 2554ci",
        description: "Color Multifunctional Printer",
        category: "Copier",
        specs: {
          speed: "25 ppm",
          color: true,
          ram: "4 GB",
          paperTray: "2 x 500 sheets",
          duplex: true,
          additionalSpecs: {
            "HDD": "320 GB",
            "Network": "Standard"
          }
        },
        quantity: 3,
        unitPrice: 145000,
        gstPercent: 18,
        gstAmount: 78300,
        total: 513300,
        isCustomItem: false
      },
      {
        id: "poi2",
        productId: "p3",
        name: "DF-7110",
        description: "Document Finisher for TASKalfa",
        category: "Finishing Machine",
        specs: {
          color: false,
          duplex: false,
          additionalSpecs: {
            "Capacity": "4000 sheets",
            "Stapling": "65 sheets"
          }
        },
        quantity: 2,
        unitPrice: 65000,
        gstPercent: 18,
        gstAmount: 23400,
        total: 153400,
        isCustomItem: false
      }
    ],
    subtotal: 565000,
    totalGst: 101700,
    grandTotal: 666700,
    createdAt: "2023-10-05",
    deliveryDate: "2023-10-25",
    status: "Received",
    notes: "Please deliver to our warehouse in Andheri.",
    terms: "Payment within 45 days of delivery."
  },
  {
    id: "po2",
    poNumber: "PO-2023-002",
    vendorId: "v2",
    vendorName: "Canon India",
    items: [
      {
        id: "poi3",
        productId: "",
        name: "Toner Cartridges",
        description: "Compatible toner for Kyocera TASKalfa",
        category: "Other",
        specs: {
          color: true,
          duplex: false,
          additionalSpecs: {
            "Yield": "15000 pages",
            "Compatible Models": "TASKalfa 2554ci, 3554ci"
          }
        },
        quantity: 10,
        unitPrice: 8500,
        gstPercent: 18,
        gstAmount: 15300,
        total: 100300,
        isCustomItem: true
      }
    ],
    subtotal: 85000,
    totalGst: 15300,
    grandTotal: 100300,
    createdAt: "2023-11-10",
    deliveryDate: "2023-11-20",
    status: "Confirmed",
    notes: "Send original invoice with shipment.",
    terms: "Payment within 30 days of delivery."
  },
  {
    id: "po3",
    poNumber: "PO-2023-003",
    vendorId: "v1",
    vendorName: "Kyocera Document Solutions",
    items: [
      {
        id: "poi4",
        productId: "p4",
        name: "TASKalfa 3554ci",
        description: "Color Multifunctional Printer",
        category: "Copier",
        specs: {
          speed: "35 ppm",
          color: true,
          ram: "4 GB",
          paperTray: "2 x 500 sheets",
          duplex: true,
          additionalSpecs: {
            "HDD": "320 GB",
            "Network": "Standard"
          }
        },
        quantity: 2,
        unitPrice: 195000,
        gstPercent: 18,
        gstAmount: 70200,
        total: 460200,
        isCustomItem: false
      }
    ],
    subtotal: 390000,
    totalGst: 70200,
    grandTotal: 460200,
    createdAt: "2023-11-15",
    deliveryDate: "2023-12-15",
    status: "Sent",
    notes: "Must be delivered before Christmas holiday.",
    terms: "Payment within 60 days of delivery."
  }
];

// Helper function to create a new quotation item
export const createQuotationItem = (
  product: Product | null,
  quantity: number,
  unitPrice: number,
  isCustomItem: boolean = false,
  customName: string = '',
  customDescription: string = '',
  customCategory: ProductCategory = 'Other'
): QuotationItem => {
  const gstAmount = (unitPrice * quantity * (product?.defaultGstPercent || 18)) / 100;
  
  return {
    id: uuidv4(),
    productId: product?.id || '',
    name: isCustomItem ? customName : (product?.name || ''),
    description: isCustomItem ? customDescription : `${product?.category} ${product?.name}`,
    category: isCustomItem ? customCategory : (product?.category || 'Other'),
    specs: isCustomItem 
      ? { color: false, duplex: false } 
      : (product?.specs || { color: false, duplex: false }),
    quantity,
    unitPrice,
    gstPercent: product?.defaultGstPercent || 18,
    gstAmount,
    total: (unitPrice * quantity) + gstAmount,
    isCustomItem
  };
};

// Helper function to create a new purchase order item
export const createPurchaseOrderItem = (
  product: Product | null,
  quantity: number,
  unitPrice: number,
  isCustomItem: boolean = false,
  customName: string = '',
  customDescription: string = '',
  customCategory: ProductCategory = 'Other'
): PurchaseOrderItem => {
  const gstAmount = (unitPrice * quantity * (product?.defaultGstPercent || 18)) / 100;
  
  return {
    id: uuidv4(),
    productId: product?.id || '',
    name: isCustomItem ? customName : (product?.name || ''),
    description: isCustomItem ? customDescription : `${product?.category} ${product?.name}`,
    category: isCustomItem ? customCategory : (product?.category || 'Other'),
    specs: isCustomItem 
      ? { color: false, duplex: false } 
      : (product?.specs || { color: false, duplex: false }),
    quantity,
    unitPrice,
    gstPercent: product?.defaultGstPercent || 18,
    gstAmount,
    total: (unitPrice * quantity) + gstAmount,
    isCustomItem
  };
};

// Helper function to generate quotation number
export const generateQuotationNumber = (): string => {
  const prefix = 'QT';
  const year = new Date().getFullYear().toString();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${year}-${randomNum}`;
};

// Helper function to generate purchase order number
export const generatePurchaseOrderNumber = (): string => {
  const prefix = 'PO';
  const year = new Date().getFullYear().toString();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${year}-${randomNum}`;
};
