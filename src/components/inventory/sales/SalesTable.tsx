
import React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Printer, CreditCard, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesStatusBadge } from "./SalesStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PaymentMethodIcon } from "./PaymentMethodIcon";

export interface SalesItem {
  id: string;
  date: string;
  customer: string;
  customerType: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  billGenerated: boolean;
  invoiceNumber: string | null;
  dueDate?: string;
}

interface SalesTableProps {
  salesData: SalesItem[];
  onGenerateBill: (item: SalesItem) => void;
  onPrintInvoice: (item: SalesItem) => void;
  onViewDetails: (item: SalesItem) => void;
  onRecordPayment: (item: SalesItem) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  salesData,
  onGenerateBill,
  onPrintInvoice,
  onViewDetails,
  onRecordPayment,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salesData.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {format(new Date(item.date), "dd/MM/yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{item.customer}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.customerType}
                  </span>
                </div>
              </TableCell>
              <TableCell>{item.itemName}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">₹{item.unitPrice}</TableCell>
              <TableCell className="text-right">₹{item.total}</TableCell>
              <TableCell>
                <SalesStatusBadge status={item.status} />
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <PaymentMethodIcon method={item.paymentMethod} />
                    <span className="text-xs">{item.paymentMethod}</span>
                  </div>
                  <PaymentStatusBadge status={item.paymentStatus} />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onViewDetails(item)}
                    title="View Details"
                  >
                    <FileText size={16} />
                  </Button>
                  
                  {!item.billGenerated && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onGenerateBill(item)}
                      title="Generate Bill"
                    >
                      <Receipt size={16} />
                    </Button>
                  )}
                  
                  {item.billGenerated && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onPrintInvoice(item)}
                      title="Print Invoice"
                    >
                      <Printer size={16} />
                    </Button>
                  )}
                  
                  {item.paymentStatus === "Due" && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onRecordPayment(item)}
                      title="Record Payment"
                    >
                      <CreditCard size={16} />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
