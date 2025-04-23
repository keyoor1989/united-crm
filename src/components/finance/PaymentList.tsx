
import React from "react";
import EntryTable from "./EntryTable";
import { Payment } from "@/types/finance";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/finance/financeUtils";

interface PaymentListProps {
  data: Payment[];
  columns?: any;
  isLoading: boolean;
  onAdd: () => void;
}

const defaultColumns = [
  {
    key: "date",
    header: "Date"
  },
  {
    key: "entityType",
    header: "Type",
    cell: (row: Payment) => {
      // Fix: Use only valid variant types instead of string variables
      let variant: "default" | "secondary" | "outline" | "destructive" | "success" | "warning" = "default";
      
      if (row.entityType === "Dealer") variant = "secondary";
      if (row.entityType === "Rental") variant = "outline";
      
      return (
        <Badge variant={variant}>
          {row.entityType}
        </Badge>
      );
    }
  },
  {
    key: "entityName",
    header: "Name"
  },
  {
    key: "amount",
    header: "Amount",
    cell: (row: Payment) => formatCurrency(Number(row.amount))
  },
  {
    key: "paymentMethod",
    header: "Payment Method"
  },
  {
    key: "reference",
    header: "Reference"
  },
  {
    key: "description",
    header: "Description"
  },
  {
    key: "invoiceNumbers",
    header: "Invoices",
    cell: (row: Payment) => row.invoiceNumbers?.join(", ") || "-"
  },
  {
    key: "receivedBy",
    header: "Received By"
  }
];

const PaymentList: React.FC<PaymentListProps> = ({ data, columns, isLoading, onAdd }) => {
  return (
    <EntryTable 
      columns={columns || defaultColumns} 
      data={data} 
      onAdd={onAdd}
      addButtonText="Add Payment Entry"
      isLoading={isLoading}
    />
  );
};

export default PaymentList;
