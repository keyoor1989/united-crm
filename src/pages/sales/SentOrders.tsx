
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  Search, MoreHorizontal, 
  Eye, FileDown, Send, CheckCircle, RefreshCw, TruckIcon
} from "lucide-react";
import { purchaseOrders } from "@/data/salesData";
import { PurchaseOrderStatus } from "@/types/sales";
import { format } from "date-fns";

const SentOrders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter only sent orders
  const filteredOrders = purchaseOrders
    .filter(o => o.status === "Sent")
    .filter(order => 
      order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sent Orders</h1>
          <p className="text-muted-foreground">
            Track and manage purchase orders that have been sent to vendors
          </p>
        </div>
        <Button 
          onClick={() => navigate("/purchase-order-form")}
          variant="outline"
        >
          New Purchase Order
        </Button>
      </div>
      
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sent orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Orders table */}
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
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/purchase-order-form/${order.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" />
                          Resend Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileDown className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <TruckIcon className="mr-2 h-4 w-4" />
                          Mark as Received
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Request Update
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
    </div>
  );
};

export default SentOrders;
