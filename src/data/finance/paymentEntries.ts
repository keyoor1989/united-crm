
import { Payment } from "@/types/finance";
import { v4 as uuidv4 } from "uuid";

// Payment entries data
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
