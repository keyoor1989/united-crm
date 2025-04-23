import { CashEntry } from "@/types/finance";
import { v4 as uuidv4 } from "uuid";

export const cashEntries: CashEntry[] = [
  {
    id: uuidv4(),
    date: "2025-04-10",
    amount: 5000,
    department: "Sales",
    category: "Machine Sale",
    description: "Cash payment for Xerox machine",
    payment_method: "Cash",
    entered_by: "John Doe",
    type: "Income",
    reference: "INV-001",
    narration: "Machine sale to XYZ Company, paid in full"
  },
  {
    id: uuidv4(),
    date: "2025-04-10",
    amount: 1500,
    department: "Administration",
    category: "Office Supplies",
    description: "Stationary purchase",
    payment_method: "Cash",
    entered_by: "Jane Smith",
    type: "Expense",
    reference: "EXP-001",
    narration: "Machine sale to XYZ Company, paid in full"
  },
  {
    id: uuidv4(),
    date: "2025-04-09",
    amount: 3000,
    department: "Service",
    category: "Service Call",
    description: "On-site service payment",
    payment_method: "Cash",
    entered_by: "John Doe",
    type: "Income",
    reference: "SRV-001",
    narration: "Machine sale to XYZ Company, paid in full"
  },
  {
    id: uuidv4(),
    date: "2025-04-09",
    amount: 800,
    department: "Service",
    category: "Transport",
    description: "Fuel for service vehicle",
    payment_method: "Cash",
    entered_by: "Mike Johnson",
    type: "Expense",
    reference: "EXP-002",
    narration: "Machine sale to XYZ Company, paid in full"
  },
  {
    id: uuidv4(),
    date: "2025-04-08",
    amount: 2500,
    department: "Sales",
    category: "AMC Payment",
    description: "AMC quarterly payment",
    payment_method: "Cash",
    entered_by: "John Doe",
    type: "Income",
    reference: "AMC-001",
    narration: "Machine sale to XYZ Company, paid in full"
  }
];
