
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Filter,
  Plus,
  Search,
  ShoppingBag,
  Download,
} from "lucide-react";
import { toast } from "sonner";

// Mock data
const salesData = [
  {
    id: "S001",
    date: "2025-04-01",
    customer: "ABC Corporation",
    itemName: "Kyocera TK-1175 Toner",
    quantity: 5,
    unitPrice: 3500,
    total: 17500,
    status: "Completed",
    paymentMethod: "Credit Card",
  },
  {
    id: "S002",
    date: "2025-03-28",
    customer: "XYZ Ltd",
    itemName: "Canon NPG-59 Drum",
    quantity: 2,
    unitPrice: 4200,
    total: 8400,
    status: "Pending",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "S003",
    date: "2025-03-25",
    customer: "Tech Solutions",
    itemName: "Ricoh SP 210 Toner",
    quantity: 8,
    unitPrice: 2400,
    total: 19200,
    status: "Completed",
    paymentMethod: "Cash",
  },
  {
    id: "S004",
    date: "2025-03-22",
    customer: "City Hospital",
    itemName: "HP CF217A Toner",
    quantity: 10,
    unitPrice: 1800,
    total: 18000,
    status: "Completed",
    paymentMethod: "Credit Card",
  },
  {
    id: "S005",
    date: "2025-03-20",
    customer: "Global Enterprises",
    itemName: "Xerox 3020 Drum Unit",
    quantity: 3,
    unitPrice: 3500,
    total: 10500,
    status: "Cancelled",
    paymentMethod: "Bank Transfer",
  },
];

const InventorySales = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);

  // Filter sales based on search query and filters
  const filteredSales = salesData.filter((sale) => {
    const matchesSearch =
      searchQuery === "" ||
      sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || sale.status === statusFilter;

    let matchesDate = true;
    const saleDate = new Date(sale.date);
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    if (dateFilter === "30days") {
      matchesDate = saleDate >= thirtyDaysAgo;
    } else if (dateFilter === "90days") {
      matchesDate = saleDate >= ninetyDaysAgo;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate total sales amount
  const totalSalesAmount = filteredSales.reduce(
    (total, sale) => total + sale.total,
    0
  );

  // Handle new sale
  const handleAddSale = () => {
    setIsAddSaleOpen(true);
  };

  // Handle export
  const handleExport = () => {
    toast.success("Sales data exported successfully!");
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sales Management</h1>
          <p className="text-muted-foreground">
            Track and manage inventory sales to customers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleAddSale}>
            <Plus className="mr-2 h-4 w-4" />
            New Sale
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search sales..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Sales
                </p>
                <p className="text-3xl font-bold">
                  ₹{totalSalesAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Items Sold
                </p>
                <p className="text-3xl font-bold">
                  {filteredSales.reduce((total, sale) => total + sale.quantity, 0)}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Transactions
                </p>
                <p className="text-3xl font-bold">{filteredSales.length}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 my-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{filteredSales.length}</span>{" "}
            sales
          </p>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="sales">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>
                        {new Date(sale.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>{sale.itemName}</TableCell>
                      <TableCell>{sale.quantity}</TableCell>
                      <TableCell>₹{sale.unitPrice.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">
                        ₹{sale.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sale.status === "Completed"
                              ? "success"
                              : sale.status === "Pending"
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {sale.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{sale.paymentMethod}</TableCell>
                    </TableRow>
                  ))}

                  {filteredSales.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="h-24 text-center"
                      >
                        No sales found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>
                Overview of sales performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center border-2 border-dashed rounded-md">
                <p className="text-muted-foreground">
                  Sales analytics chart will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Sale Dialog */}
      <Dialog open={isAddSaleOpen} onOpenChange={setIsAddSaleOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Sale</DialogTitle>
            <DialogDescription>
              Record a new sale of inventory items
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Input id="customer" placeholder="Customer name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <Select>
                <SelectTrigger id="item">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="item1">Kyocera TK-1175 Toner</SelectItem>
                  <SelectItem value="item2">Canon NPG-59 Drum</SelectItem>
                  <SelectItem value="item3">Ricoh SP 210 Toner</SelectItem>
                  <SelectItem value="item4">HP CF217A Toner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" min="1" defaultValue="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (₹)</Label>
                <Input id="unitPrice" type="number" min="0" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment">Payment Method</Label>
              <Select>
                <SelectTrigger id="payment">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" placeholder="Additional notes" />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddSaleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                toast.success("Sale recorded successfully!");
                setIsAddSaleOpen(false);
              }}
            >
              Create Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventorySales;
