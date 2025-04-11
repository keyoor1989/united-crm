
import { Receivable } from "@/types/finance";
import { v4 as uuidv4 } from "uuid";

// Receivable entries data
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
