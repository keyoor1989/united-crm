
import { CashEntry } from "@/types/finance";
import { v4 as uuidv4 } from "uuid";

// Cash entries data
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
