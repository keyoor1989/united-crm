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
  MoreHorizontal,
  FileText,
  DollarSign,
  Eye,
  Truck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { SalesStatusBadge } from "./SalesStatusBadge";
import { PaymentMethodIcon } from "./PaymentMethodIcon";
import { Skeleton } from "@/components/ui/skeleton";

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
  createdBy?: string;
  shipmentMethod?: string | null;
  shipmentDetails?: {
    courier_name?: string;
    tracking_number?: string;
    bus_details?: string;
    train_details?: string;
    additional_details?: string;
    status?: string;
  } | null;
}

interface SalesTableProps {
  salesData: SalesItem[];
  loading: boolean;
  onGenerateBill: (sale: SalesItem) => void;
  onPrintInvoice: (sale: SalesItem) => void;
  onViewDetails: (sale: SalesItem) => void;
  onRecordPayment: (sale: SalesItem) => void;
  onUpdateShipment?: (sale: SalesItem) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  salesData,
  loading,
  onGenerateBill,
  onPrintInvoice,
  onViewDetails,
  onRecordPayment,
  onUpdateShipment
}) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Shipment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                {Array.from({ length: 10 }).map((_, cellIndex) => (
                  <TableCell key={`cell-${cellIndex}`}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : salesData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                No sales records found
              </TableCell>
            </TableRow>
          ) : (
            salesData.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  {new Date(sale.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium max-w-[150px] truncate" title={sale.customer}>
                  {sale.customer}
                </TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-1 bg-slate-100 rounded-full">
                    {sale.customerType}
                  </span>
                </TableCell>
                <TableCell className="max-w-[150px] truncate" title={sale.itemName}>
                  {sale.itemName}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{sale.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <SalesStatusBadge status={sale.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <PaymentMethodIcon method={sale.paymentMethod} />
                    <PaymentStatusBadge status={sale.paymentStatus} />
                  </div>
                </TableCell>
                <TableCell>
                  {sale.createdBy || 'Admin'}
                </TableCell>
                <TableCell>
                  {sale.shipmentMethod || 'Not Shipped'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(sale)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      
                      {!sale.billGenerated && (
                        <DropdownMenuItem onClick={() => onGenerateBill(sale)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate bill
                        </DropdownMenuItem>
                      )}
                      
                      {sale.billGenerated && sale.invoiceNumber && (
                        <DropdownMenuItem onClick={() => onPrintInvoice(sale)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Print invoice
                        </DropdownMenuItem>
                      )}
                      
                      {sale.paymentStatus === "Due" && (
                        <DropdownMenuItem onClick={() => onRecordPayment(sale)}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Record payment
                        </DropdownMenuItem>
                      )}

                      {onUpdateShipment && (
                        <DropdownMenuItem onClick={() => onUpdateShipment(sale)}>
                          <Truck className="mr-2 h-4 w-4" />
                          Update shipment
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
