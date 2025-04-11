
import { 
  CashEntry, 
  Revenue, 
  Expense, 
  Payment, 
  Receivable,
  DepartmentSummary,
  FinanceSummary,
  FinanceTrend
} from "@/types/finance";
import { v4 as uuidv4 } from "uuid";

// Mock data for each section
export const cashEntries: CashEntry[] = [
  {
    id: uuidv4(),
    date: "2025-04-10",
    amount: 5000,
    department: "Sales",
    category: "Machine Sale",
    description: "Cash payment for Xerox machine",
    paymentMethod: "Cash",
    enteredBy: "John Doe",
    type: "Income",
    reference: "INV-001"
  },
  {
    id: uuidv4(),
    date: "2025-04-10",
    amount: 1500,
    department: "Administration",
    category: "Office Supplies",
    description: "Stationary purchase",
    paymentMethod: "Cash",
    enteredBy: "Jane Smith",
    type: "Expense",
    reference: "EXP-001"
  },
  {
    id: uuidv4(),
    date: "2025-04-09",
    amount: 3000,
    department: "Service",
    category: "Service Call",
    description: "On-site service payment",
    paymentMethod: "Cash",
    enteredBy: "John Doe",
    type: "Income",
    reference: "SRV-001"
  },
  {
    id: uuidv4(),
    date: "2025-04-09",
    amount: 800,
    department: "Service",
    category: "Transport",
    description: "Fuel for service vehicle",
    paymentMethod: "Cash",
    enteredBy: "Mike Johnson",
    type: "Expense",
    reference: "EXP-002"
  },
  {
    id: uuidv4(),
    date: "2025-04-08",
    amount: 2500,
    department: "Sales",
    category: "AMC Payment",
    description: "AMC quarterly payment",
    paymentMethod: "Cash",
    enteredBy: "John Doe",
    type: "Income",
    reference: "AMC-001"
  }
];

export const revenueEntries: Revenue[] = [
  {
    id: uuidv4(),
    date: "2025-04-10",
    department: "Sales",
    category: "Machine Sales",
    amount: 75000,
    description: "Canon iR2525 Copier",
    customer: "ABC Corporation",
    invoiceNumber: "INV-2025-001",
    paymentStatus: "Paid",
    paymentMethod: "Cheque"
  },
  {
    id: uuidv4(),
    date: "2025-04-09",
    department: "Service",
    category: "Repairs",
    amount: 12000,
    description: "Major repair of Xerox WorkCentre",
    customer: "XYZ Ltd",
    invoiceNumber: "INV-2025-002",
    paymentStatus: "Pending",
    paymentMethod: "Credit"
  },
  {
    id: uuidv4(),
    date: "2025-04-08",
    department: "Sales",
    category: "Consumables",
    amount: 28000,
    description: "Toner cartridges bulk order",
    customer: "Government Office",
    invoiceNumber: "INV-2025-003",
    paymentStatus: "Partial",
    paymentMethod: "Bank Transfer"
  },
  {
    id: uuidv4(),
    date: "2025-04-07",
    department: "AMC",
    category: "Contract",
    amount: 45000,
    description: "Annual maintenance contract renewal",
    customer: "City Hospital",
    invoiceNumber: "INV-2025-004",
    paymentStatus: "Paid",
    paymentMethod: "Online"
  },
  {
    id: uuidv4(),
    date: "2025-04-06",
    department: "Rental",
    category: "Equipment Rental",
    amount: 18000,
    description: "3-month copier rental",
    customer: "Legal Firm Inc.",
    invoiceNumber: "INV-2025-005",
    paymentStatus: "Paid",
    paymentMethod: "Cheque"
  }
];

export const expenseEntries: Expense[] = [
  {
    id: uuidv4(),
    date: "2025-04-10",
    department: "Administration",
    category: "Rent",
    amount: 30000,
    description: "Office rent for April",
    vendor: "Building Management",
    billNumber: "RENT-APR-2025",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    approvedBy: "CEO"
  },
  {
    id: uuidv4(),
    date: "2025-04-09",
    department: "Service",
    category: "Parts Purchase",
    amount: 15000,
    description: "Spare parts inventory restocking",
    vendor: "Parts Supplier Co.",
    billNumber: "BILL-2025-102",
    paymentStatus: "Paid",
    paymentMethod: "Cheque",
    approvedBy: "Service Manager"
  },
  {
    id: uuidv4(),
    date: "2025-04-08",
    department: "Sales",
    category: "Marketing",
    amount: 8000,
    description: "Promotional materials printing",
    vendor: "Print Shop",
    billNumber: "INV-PS-456",
    paymentStatus: "Pending",
    paymentMethod: "Credit",
    approvedBy: "Sales Manager"
  },
  {
    id: uuidv4(),
    date: "2025-04-07",
    department: "Service",
    category: "Vehicle Maintenance",
    amount: 5500,
    description: "Service vehicle repair",
    vendor: "Auto Garage",
    billNumber: "SRV-789",
    paymentStatus: "Paid",
    paymentMethod: "Cash",
    approvedBy: "Operations Manager"
  },
  {
    id: uuidv4(),
    date: "2025-04-06",
    department: "Administration",
    category: "Utilities",
    amount: 7500,
    description: "Electricity and water bills",
    vendor: "Utility Provider",
    billNumber: "UTIL-APR25",
    paymentStatus: "Paid",
    paymentMethod: "Online",
    approvedBy: "Finance Manager"
  }
];

export const paymentEntries: Payment[] = [
  {
    id: uuidv4(),
    date: "2025-04-10",
    entityType: "Customer",
    entityName: "ABC Corporation",
    amount: 75000,
    paymentMethod: "Cheque",
    reference: "CHQ-123456",
    description: "Payment for 2 new machines",
    invoiceNumbers: ["INV-2025-001", "INV-2025-002"],
    receivedBy: "John Doe"
  },
  {
    id: uuidv4(),
    date: "2025-04-09",
    entityType: "Dealer",
    entityName: "Canon Distributor",
    amount: 150000,
    paymentMethod: "Bank Transfer",
    reference: "TRF-987654",
    description: "Payment for March machines order",
    receivedBy: "Jane Smith"
  },
  {
    id: uuidv4(),
    date: "2025-04-08",
    entityType: "Customer",
    entityName: "City Hospital",
    amount: 45000,
    paymentMethod: "Online",
    reference: "ONL-112233",
    description: "AMC payment",
    invoiceNumbers: ["INV-2025-004"],
    receivedBy: "John Doe"
  },
  {
    id: uuidv4(),
    date: "2025-04-07",
    entityType: "Customer",
    entityName: "Government Office",
    amount: 15000,
    paymentMethod: "Bank Transfer",
    reference: "TRF-556677",
    description: "Partial payment for consumables",
    invoiceNumbers: ["INV-2025-003"],
    receivedBy: "Mike Johnson"
  },
  {
    id: uuidv4(),
    date: "2025-04-06",
    entityType: "Dealer",
    entityName: "Toner Supplier Ltd",
    amount: 85000,
    paymentMethod: "Cheque",
    reference: "CHQ-889900",
    description: "Payment for toner cartridges",
    receivedBy: "Jane Smith"
  }
];

export const receivableEntries: Receivable[] = [
  {
    id: uuidv4(),
    invoiceNumber: "INV-2025-002",
    customer: "XYZ Ltd",
    date: "2025-03-15",
    dueDate: "2025-04-15",
    amount: 12000,
    amountPaid: 0,
    balance: 12000,
    status: "Due Soon",
    lastFollowUp: "2025-04-08",
    notes: "Will pay by due date",
    contactPerson: "Mr. Smith",
    contactNumber: "9876543210",
    priority: "Medium"
  },
  {
    id: uuidv4(),
    invoiceNumber: "INV-2025-003",
    customer: "Government Office",
    date: "2025-03-10",
    dueDate: "2025-04-10",
    amount: 28000,
    amountPaid: 15000,
    balance: 13000,
    status: "Due",
    lastFollowUp: "2025-04-09",
    notes: "Promised to pay remaining amount soon",
    contactPerson: "Mr. Kumar",
    contactNumber: "8765432109",
    priority: "Medium"
  },
  {
    id: uuidv4(),
    invoiceNumber: "INV-2025-005",
    customer: "Legal Firm Inc.",
    date: "2025-03-25",
    dueDate: "2025-04-25",
    amount: 18000,
    amountPaid: 0,
    balance: 18000,
    status: "Due Soon",
    lastFollowUp: "2025-04-07",
    notes: "Waiting for approval from management",
    contactPerson: "Ms. Jones",
    contactNumber: "7654321098",
    priority: "Low"
  },
  {
    id: uuidv4(),
    invoiceNumber: "INV-2025-001",
    customer: "University",
    date: "2025-02-15",
    dueDate: "2025-03-15",
    amount: 35000,
    amountPaid: 20000,
    balance: 15000,
    status: "Overdue",
    lastFollowUp: "2025-04-05",
    notes: "Promised payment next week",
    contactPerson: "Dr. Williams",
    contactNumber: "6543210987",
    priority: "High"
  },
  {
    id: uuidv4(),
    invoiceNumber: "INV-2025-000",
    customer: "Tech Solutions",
    date: "2025-02-10",
    dueDate: "2025-03-10",
    amount: 42000,
    amountPaid: 0,
    balance: 42000,
    status: "Overdue",
    lastFollowUp: "2025-04-09",
    notes: "Financial issues, requested payment plan",
    contactPerson: "Mr. Richards",
    contactNumber: "5432109876",
    priority: "High"
  }
];

// Dashboard data
export const departmentSummary: DepartmentSummary[] = [
  {
    name: "Sales",
    revenue: 118000,
    expenses: 8000,
    profit: 110000
  },
  {
    name: "Service",
    revenue: 15000,
    expenses: 20500,
    profit: -5500
  },
  {
    name: "AMC",
    revenue: 45000,
    expenses: 10000,
    profit: 35000
  },
  {
    name: "Rental",
    revenue: 18000,
    expenses: 5000,
    profit: 13000
  },
  {
    name: "Administration",
    revenue: 0,
    expenses: 37500,
    profit: -37500
  }
];

export const financeSummary: FinanceSummary = {
  totalRevenue: 196000,
  totalExpenses: 81000,
  netProfit: 115000,
  cashInHand: 23000,
  pendingReceivables: 100000,
  upcomingPayments: 45000
};

export const financeMonthlyTrend: FinanceTrend[] = [
  {
    month: "Jan",
    revenue: 180000,
    expenses: 75000,
    profit: 105000
  },
  {
    month: "Feb",
    revenue: 185000,
    expenses: 78000,
    profit: 107000
  },
  {
    month: "Mar",
    revenue: 190000,
    expenses: 80000,
    profit: 110000
  },
  {
    month: "Apr",
    revenue: 196000,
    expenses: 81000,
    profit: 115000
  }
];

export const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const departments = [
  "Sales", "Service", "AMC", "Rental", "Administration", "Marketing"
];

export const categories = {
  income: [
    "Machine Sale", "AMC Contract", "Service Call", "Repairs", 
    "Consumables Sale", "Rental Income", "Installation"
  ],
  expense: [
    "Office Supplies", "Rent", "Utilities", "Salaries", "Transport", 
    "Marketing", "Parts Purchase", "Consumables", "Maintenance"
  ]
};

export const paymentMethods = [
  "Cash", "Cheque", "Bank Transfer", "Online", "Credit Card", "UPI", "Credit (Due)"
];
