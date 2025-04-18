
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  created_by_user_id?: string;
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
  const { data: users } = useQuery({
    queryKey: ['app_users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_users')
        .select('id, name');
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      return data;
    }
  });

  const getUserName = (userId: string | undefined) => {
    if (!userId) return 'N/A';
    const user = users?.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

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
            <TableHead className="text-right">Sales Person</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
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
                <TableCell>
                  {getUserName(sale.created_by_user_id)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 p-0 focus:ring-0 rounded-full hover:bg-slate-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-[180px] bg-white shadow-md"
                      sideOffset={5}
                      avoidCollisions
                    >
                      <DropdownMenuItem 
                        onClick={() => onViewDetails(sale)}
                        className="cursor-pointer hover:bg-slate-50"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      
                      {!sale.billGenerated && (
                        <DropdownMenuItem 
                          onClick={() => onGenerateBill(sale)}
                          className="cursor-pointer hover:bg-slate-50"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Generate bill
                        </DropdownMenuItem>
                      )}
                      
                      {sale.billGenerated && sale.invoiceNumber && (
                        <DropdownMenuItem 
                          onClick={() => onPrintInvoice(sale)}
                          className="cursor-pointer hover:bg-slate-50"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Print invoice
                        </DropdownMenuItem>
                      )}
                      
                      {sale.paymentStatus === "Due" && (
                        <DropdownMenuItem 
                          onClick={() => onRecordPayment(sale)}
                          className="cursor-pointer hover:bg-slate-50"
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Record payment
                        </DropdownMenuItem>
                      )}

                      {onUpdateShipment && (
                        <DropdownMenuItem 
                          onClick={() => onUpdateShipment(sale)}
                          className="cursor-pointer hover:bg-slate-50"
                        >
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
