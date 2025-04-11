
import { Revenue } from "@/types/finance";
import { v4 as uuidv4 } from "uuid";

// Revenue entries data
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
