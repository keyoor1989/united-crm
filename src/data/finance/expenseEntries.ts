
import { Expense } from "@/types/finance";
import { v4 as uuidv4 } from "uuid";

// Expense entries data
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
