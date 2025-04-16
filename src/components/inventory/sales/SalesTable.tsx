
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Eye, 
  CreditCard, 
  MoreHorizontal,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SalesStatusBadge } from "./SalesStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PaymentMethodIcon } from "./PaymentMethodIcon";
import { formatCurrency } from "@/utils/finance/financeUtils";

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
  loading?: boolean;
  onGenerateBill: (sale: SalesItem) => void;
  onPrintInvoice: (sale: SalesItem) => void;
  onViewDetails: (sale: SalesItem) => void;
  onRecordPayment: (sale: SalesItem) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  salesData,
  loading = false,
  onGenerateBill,
  onPrintInvoice,
  onViewDetails,
  onRecordPayment,
}) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-48">
                <div className="flex flex-col items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p>Loading sales data...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : salesData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24">
                No sales records found
              </TableCell>
            </TableRow>
          ) : (
            salesData.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  {new Date(sale.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{sale.customer}</p>
                    <p className="text-xs text-muted-foreground">{sale.customerType}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{sale.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      {sale.quantity} x {formatCurrency(sale.unitPrice)}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(sale.total)}
                </TableCell>
                <TableCell>
                  <SalesStatusBadge status={sale.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <PaymentMethodIcon method={sale.paymentMethod} />
                    <PaymentStatusBadge status={sale.paymentStatus} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(sale)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {!sale.billGenerated && (
                        <DropdownMenuItem onClick={() => onGenerateBill(sale)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate Bill
                        </DropdownMenuItem>
                      )}
                      {sale.billGenerated && sale.invoiceNumber && (
                        <DropdownMenuItem onClick={() => onPrintInvoice(sale)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Print Invoice
                        </DropdownMenuItem>
                      )}
                      {sale.paymentStatus !== "Paid" && (
                        <DropdownMenuItem onClick={() => onRecordPayment(sale)}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Record Payment
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
