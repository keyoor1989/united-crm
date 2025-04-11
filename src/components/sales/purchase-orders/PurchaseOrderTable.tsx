
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell 
} from "@/components/ui/table";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { PurchaseOrder, PurchaseOrderStatus } from "@/types/sales";
import PurchaseOrderStatusBadge from "./PurchaseOrderStatusBadge";
import PurchaseOrderActionsMenu from "./PurchaseOrderActionsMenu";

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
}

const PurchaseOrderTable: React.FC<PurchaseOrderTableProps> = ({ orders }) => {
  const navigate = useNavigate();

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO #</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Delivery Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.poNumber}
                </TableCell>
                <TableCell>{order.vendorName}</TableCell>
                <TableCell>
                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(order.deliveryDate), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="font-medium">
                  ₹{order.grandTotal.toLocaleString()}
                </TableCell>
                <TableCell>
                  <PurchaseOrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-right">
                  <PurchaseOrderActionsMenu order={order} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No purchase orders found</p>
                <Button 
                  variant="link" 
                  onClick={() => navigate("/purchase-order-form")} 
                  className="mt-2"
                >
                  Create your first purchase order
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PurchaseOrderTable;
