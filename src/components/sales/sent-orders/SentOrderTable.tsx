
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { PurchaseOrder } from "@/types/sales";
import SentOrderActionsMenu from "./SentOrderActionsMenu";

interface SentOrderTableProps {
  orders: PurchaseOrder[];
}

const SentOrderTable: React.FC<SentOrderTableProps> = ({ orders }) => {
  const navigate = useNavigate();

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO #</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Sent Date</TableHead>
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
                  <Badge variant="secondary">Sent</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <SentOrderActionsMenu order={order} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                <p>No sent orders found</p>
                <Button 
                  variant="link" 
                  onClick={() => navigate("/purchase-order-form")} 
                  className="mt-2"
                >
                  Create a new purchase order
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SentOrderTable;
