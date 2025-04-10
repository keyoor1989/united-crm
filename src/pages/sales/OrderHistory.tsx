import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { 
  Search, MoreHorizontal, Eye, 
  Download, History, RotateCcw, ClockIcon, TruckIcon,
  FileDown, CheckCircle, CheckSquare, ArchiveRestore,
  BarChart3, Calendar
} from "lucide-react";
import { purchaseOrders } from "@/data/salesData";
import { PurchaseOrderStatus } from "@/types/sales";
import { format } from "date-fns";
import { generatePurchaseOrderPdf } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

const ordersWithHistory = purchaseOrders.map(order => ({
  ...order,
  history: [
    { 
      status: "Draft", 
      date: new Date(new Date(order.createdAt).getTime() - 86400000 * 2).toISOString(), 
      user: "John Doe"
    },
    { 
      status: "Sent", 
      date: new Date(new Date(order.createdAt).getTime() - 86400000).toISOString(), 
      user: "John Doe"
    },
    { 
      status: order.status, 
      date: order.createdAt, 
      user: "System"
    }
  ]
}));

const OrderHistory = () => {
  const navigate = useNavigate(); // Use the real useNavigate hook from react-router-dom
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | "All">("All");
  const [viewDetailsOrder, setViewDetailsOrder] = useState<string | null>(null);
  const { toast } = useToast();
  
  const filteredOrders = ordersWithHistory.filter(order => {
    const matchesSearch = 
      order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    
    const matchesTime = true; // Placeholder for actual date filtering
    
    return matchesSearch && matchesStatus && matchesTime;
  });
  
  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case "Draft":
        return <Badge variant="outline">Draft</Badge>;
      case "Sent":
        return <Badge variant="secondary">Sent</Badge>;
      case "Confirmed":
        return <Badge variant="success" className="bg-green-500 hover:bg-green-600">Confirmed</Badge>;
      case "Received":
        return <Badge variant="default">Received</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const selectedOrder = viewDetailsOrder 
    ? ordersWithHistory.find(order => order.id === viewDetailsOrder) 
    : null;
  
  const handleDownloadPdf = (order: typeof ordersWithHistory[0]) => {
    try {
      generatePurchaseOrderPdf(order);
      toast({
        title: "PDF Generated",
        description: `Purchase Order ${order.poNumber} has been downloaded.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      });
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order History</h1>
          <p className="text-muted-foreground">
            Track the history and status changes of your purchase orders
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/purchase-orders")} 
        >
          View Purchase Orders
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Completed Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ordersWithHistory.filter(order => order.status === "Received").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TruckIcon className="h-4 w-4" />
              In Transit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ordersWithHistory.filter(order => order.status === "Confirmed").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              Awaiting Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ordersWithHistory.filter(order => order.status === "Sent").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <ArchiveRestore className="h-4 w-4" />
              Order Updates This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={timeFilter}
            onValueChange={setTimeFilter}
          >
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as PurchaseOrderStatus | "All")}
          >
            <SelectTrigger className="w-[150px]">
              <BarChart3 className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Received">Received</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO #</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
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
                    {format(new Date(order.history[order.history.length - 1].date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{order.grandTotal.toLocaleString()}
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
                        <DropdownMenuItem onClick={() => setViewDetailsOrder(order.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Order History
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/purchase-order-form/${order.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Order Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPdf(order)}>
                          <FileDown className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Reorder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <History className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No order history found</p>
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
      
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg border shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Order History</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setViewDetailsOrder(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </Button>
              </div>
              
              <div className="mb-4">
                <div className="text-muted-foreground text-sm mb-1">Purchase Order</div>
                <div className="text-lg font-medium">{selectedOrder.poNumber}</div>
              </div>
              
              <div className="mb-4">
                <div className="text-muted-foreground text-sm mb-1">Vendor</div>
                <div className="text-lg font-medium">{selectedOrder.vendorName}</div>
              </div>
              
              <div className="mb-6">
                <div className="text-muted-foreground text-sm mb-1">Current Status</div>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Status Timeline</h3>
                <div className="space-y-6">
                  {selectedOrder.history.map((historyItem, index) => (
                    <div key={index} className="relative pl-6 pb-6 group">
                      {index < selectedOrder.history.length - 1 && (
                        <div className="absolute left-2.5 top-2 w-px h-full bg-border group-last:hidden"></div>
                      )}
                      
                      <div className="absolute left-0 top-0 w-5 h-5 rounded-full border-2 border-primary bg-background"></div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium">
                            {historyItem.status}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Updated by {historyItem.user}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {format(new Date(historyItem.date), "MMM dd, yyyy - h:mm a")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setViewDetailsOrder(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
