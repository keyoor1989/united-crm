
import React, { useState, useEffect } from "react";
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
  CreditCard,
  Calendar,
  IndianRupee,
  Receipt,
  FileText,
  Printer,
  Wallet,
  Bank
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// Enhanced mock data with payment status and more details
const salesData = [
  {
    id: "S001",
    date: "2025-04-01",
    customer: "ABC Corporation",
    customerType: "Dealer",
    itemName: "Kyocera TK-1175 Toner",
    quantity: 5,
    unitPrice: 3500,
    total: 17500,
    status: "Completed",
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    billGenerated: true,
    invoiceNumber: "INV-2025-001"
  },
  {
    id: "S002",
    date: "2025-03-28",
    customer: "XYZ Ltd",
    customerType: "Customer",
    itemName: "Canon NPG-59 Drum",
    quantity: 2,
    unitPrice: 4200,
    total: 8400,
    status: "Pending",
    paymentMethod: "Bank Transfer",
    paymentStatus: "Pending",
    billGenerated: true,
    invoiceNumber: "INV-2025-002"
  },
  {
    id: "S003",
    date: "2025-03-25",
    customer: "Tech Solutions",
    customerType: "Dealer",
    itemName: "Ricoh SP 210 Toner",
    quantity: 8,
    unitPrice: 2400,
    total: 19200,
    status: "Completed",
    paymentMethod: "Cash",
    paymentStatus: "Paid",
    billGenerated: false,
    invoiceNumber: null
  },
  {
    id: "S004",
    date: "2025-03-22",
    customer: "City Hospital",
    customerType: "Government",
    itemName: "HP CF217A Toner",
    quantity: 10,
    unitPrice: 1800,
    total: 18000,
    status: "Completed",
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    billGenerated: true,
    invoiceNumber: "INV-2025-003"
  },
  {
    id: "S005",
    date: "2025-03-20",
    customer: "Global Enterprises",
    customerType: "Customer",
    itemName: "Xerox 3020 Drum Unit",
    quantity: 3,
    unitPrice: 3500,
    total: 10500,
    status: "Credit Sale",
    paymentMethod: "Credit",
    paymentStatus: "Due",
    billGenerated: true,
    invoiceNumber: "INV-2025-004",
    dueDate: "2025-04-20"
  },
];

// Mock product categories
const productCategories = [
  "Toner",
  "Drum",
  "Spare Parts",
  "Copier Machine",
  "Printer",
  "Finishing Machine"
];

// Mock payment types
const paymentMethods = [
  { value: "cash", label: "Cash", icon: Wallet },
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank Transfer", icon: Bank },
  { value: "upi", label: "UPI", icon: IndianRupee },
  { value: "credit", label: "Credit (Due Payment)", icon: Calendar },
];

// Mock customer types
const customerTypes = [
  { value: "customer", label: "Regular Customer" },
  { value: "dealer", label: "Dealer" },
  { value: "government", label: "Government" },
];

const InventorySales = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [generateBill, setGenerateBill] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [selectedCustomerType, setSelectedCustomerType] = useState("customer");
  const [dueDate, setDueDate] = useState("");
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    // Set a default due date for credit sales (30 days from now)
    if (selectedPaymentMethod === "credit") {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      setDueDate(futureDate.toISOString().split('T')[0]);
    }
  }, [selectedPaymentMethod]);

  // Filter sales based on search query and filters
  const filteredSales = salesData.filter((sale) => {
    const matchesSearch =
      searchQuery === "" ||
      sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sale.invoiceNumber && sale.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || sale.status === statusFilter;
      
    const matchesCustomerType =
      customerTypeFilter === "all" || 
      (sale.customerType && sale.customerType.toLowerCase() === customerTypeFilter);
      
    const matchesPaymentStatus =
      paymentStatusFilter === "all" || 
      (sale.paymentStatus && sale.paymentStatus.toLowerCase() === paymentStatusFilter.toLowerCase());

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

    return matchesSearch && matchesStatus && matchesDate && matchesCustomerType && matchesPaymentStatus;
  });

  // Calculate total sales amount
  const totalSalesAmount = filteredSales.reduce(
    (total, sale) => total + sale.total,
    0
  );
  
  // Calculate pending payments amount
  const pendingPaymentsAmount = filteredSales
    .filter(sale => sale.paymentStatus === "Due" || sale.paymentStatus === "Pending")
    .reduce((total, sale) => total + sale.total, 0);
  
  // Calculate cash sales amount
  const cashSalesAmount = filteredSales
    .filter(sale => sale.paymentMethod === "Cash")
    .reduce((total, sale) => total + sale.total, 0);

  // Handle new sale
  const handleAddSale = () => {
    setIsAddSaleOpen(true);
  };

  // Handle export
  const handleExport = () => {
    toast.success("Sales data exported successfully!");
  };
  
  // Handle bill print
  const handlePrintBill = (sale) => {
    setSelectedSale(sale);
    setIsPrintDialogOpen(true);
  };
  
  // Handle sale creation
  const handleCreateSale = () => {
    const paymentStatus = selectedPaymentMethod === "credit" ? "Due" : "Paid";
    const status = selectedPaymentMethod === "credit" ? "Credit Sale" : "Completed";
    
    // In a real app, this would be submitted to the backend
    toast.success(`Sale recorded successfully! ${generateBill ? "Bill generated." : "No bill generated."}`);
    setIsAddSaleOpen(false);
  };

  // Calculate days overdue
  const calculateDaysOverdue = (dueDateString) => {
    if (!dueDateString) return 0;
    
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const timeDiff = today.getTime() - dueDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    return Math.max(0, daysDiff);
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sales Management</h1>
          <p className="text-muted-foreground">
            Track and manage sales transactions
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
            placeholder="Search sales by customer, item, invoice..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                  Cash Sales
                </p>
                <p className="text-3xl font-bold">
                  ₹{cashSalesAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Payments
                </p>
                <p className="text-3xl font-bold">
                  ₹{pendingPaymentsAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <Calendar className="h-6 w-6 text-amber-600" />
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
                <Receipt className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sales">All Sales</TabsTrigger>
          <TabsTrigger value="credit">Credit Sales</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
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
                <SelectItem value="Credit Sale">Credit Sale</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Customer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="customer">Regular Customer</SelectItem>
                <SelectItem value="dealer">Dealer</SelectItem>
                <SelectItem value="government">Government</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="due">Due</SelectItem>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {sale.invoiceNumber || sale.id}
                        {!sale.billGenerated && (
                          <Badge variant="outline" className="ml-2">No Bill</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(sale.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {sale.customerType || "Customer"}
                        </Badge>
                      </TableCell>
                      <TableCell>{sale.itemName}</TableCell>
                      <TableCell>{sale.quantity}</TableCell>
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
                              : sale.status === "Credit Sale"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {sale.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{sale.paymentMethod}</span>
                          <Badge 
                            variant={
                              sale.paymentStatus === "Paid" 
                                ? "success" 
                                : sale.paymentStatus === "Pending" 
                                ? "warning" 
                                : "destructive"
                            }
                            className="mt-1"
                          >
                            {sale.paymentStatus}
                          </Badge>
                          {sale.dueDate && (
                            <span className="text-xs text-muted-foreground mt-1">
                              Due: {new Date(sale.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handlePrintBill(sale)}
                            disabled={!sale.billGenerated}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredSales.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={10}
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

        <TabsContent value="credit">
          <Card>
            <CardHeader>
              <CardTitle>Credit Sales</CardTitle>
              <CardDescription>
                Manage outstanding payments and credit sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Sale Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales
                    .filter(sale => sale.paymentStatus === "Due")
                    .map(sale => {
                      const daysOverdue = calculateDaysOverdue(sale.dueDate);
                      
                      return (
                        <TableRow key={sale.id}>
                          <TableCell>{sale.invoiceNumber || sale.id}</TableCell>
                          <TableCell>{sale.customer}</TableCell>
                          <TableCell>₹{sale.total.toLocaleString()}</TableCell>
                          <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                          <TableCell>{sale.dueDate ? new Date(sale.dueDate).toLocaleDateString() : "N/A"}</TableCell>
                          <TableCell>
                            {daysOverdue > 0 ? (
                              <Badge variant="destructive">{daysOverdue} days</Badge>
                            ) : (
                              <Badge variant="outline">Not overdue</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button size="sm">Record Payment</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    
                  {filteredSales.filter(sale => sale.paymentStatus === "Due").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No credit sales found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Sales Reports</CardTitle>
              <CardDescription>
                View and generate detailed sales reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <FileText className="h-8 w-8 mb-2" />
                  <span>Daily Sales Report</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Calendar className="h-8 w-8 mb-2" />
                  <span>Monthly Sales Report</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <ShoppingBag className="h-8 w-8 mb-2" />
                  <span>Product Sales Report</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <IndianRupee className="h-8 w-8 mb-2" />
                  <span>Tax Report (GST)</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Sale Dialog */}
      <Dialog open={isAddSaleOpen} onOpenChange={setIsAddSaleOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Record New Sale</DialogTitle>
            <DialogDescription>
              Create a new sales transaction for inventory items
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerType">Customer Type</Label>
                <Select value={selectedCustomerType} onValueChange={setSelectedCustomerType}>
                  <SelectTrigger id="customerType">
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input id="customer" placeholder="Customer name" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toner1">Kyocera TK-1175 Toner</SelectItem>
                  <SelectItem value="toner2">HP CF217A Toner</SelectItem>
                  <SelectItem value="drum1">Canon NPG-59 Drum</SelectItem>
                  <SelectItem value="drum2">Xerox 3020 Drum Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" min="1" placeholder="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit-price">Unit Price (₹)</Label>
                <Input id="unit-price" type="number" min="0" placeholder="0.00" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(method => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center">
                        {React.createElement(method.icon, { className: "h-4 w-4 mr-2" })}
                        {method.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedPaymentMethod === "credit" && (
              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input id="due-date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="generate-bill"
                checked={generateBill}
                onChange={() => setGenerateBill(!generateBill)}
                className="rounded border-gray-300 focus:ring-primary"
              />
              <Label htmlFor="generate-bill">Generate Bill/Invoice</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSaleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSale}>
              Complete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Print Invoice Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Print Invoice</DialogTitle>
            <DialogDescription>
              Select print options for this invoice
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-center p-6 border rounded-md">
              <div className="space-y-2 text-center">
                <Printer className="h-16 w-16 mx-auto text-primary/70" />
                <p>Invoice #{selectedSale?.invoiceNumber || selectedSale?.id}</p>
                <p className="text-sm text-muted-foreground">Ready to print</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="print-copies">Number of Copies</Label>
              <Input id="print-copies" type="number" min="1" defaultValue="1" />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-company-header"
                defaultChecked={true}
                className="rounded border-gray-300 focus:ring-primary"
              />
              <Label htmlFor="include-company-header">Include Company Header</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success("Invoice sent to printer!");
              setIsPrintDialogOpen(false);
            }}>
              Print Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventorySales;
