import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  ShoppingBag,
  Plus,
  FileText,
  Search,
  Filter,
  Users,
  Building,
  UserCheck,
  Download,
  Printer,
  AlertTriangle
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CustomerType, PaymentStatus, SaleStatus, Sale } from "@/types/inventory";

// Sample sales data for demonstration
const sampleSales: Sale[] = [
  {
    id: "1",
    invoiceNo: "INV-2025-0001",
    customerId: "C001",
    customerName: "ABC Corporation",
    customerType: "Regular",
    date: "2025-04-02",
    items: [
      {
        id: "SI001",
        saleId: "1",
        itemId: "IT001",
        itemName: "Kyocera 2554ci Toner Black",
        quantity: 2,
        unitPrice: 4500,
        taxRate: 18,
        discount: 0,
        total: 9000
      }
    ],
    subtotal: 9000,
    taxAmount: 1620,
    taxType: "GST",
    discount: 0,
    total: 10620,
    paymentStatus: "Completed",
    paymentMethod: "Online Transfer",
    amountPaid: 10620,
    amountDue: 0,
    notes: "Regular customer",
    status: "Delivered",
    warehouseId: "W001",
    createdBy: "Admin",
    createdAt: "2025-04-02T10:30:00",
    updatedAt: "2025-04-02T10:30:00",
    stockDeducted: true
  },
  {
    id: "2",
    invoiceNo: "INV-2025-0002",
    customerId: "C002",
    customerName: "MP Government Department",
    customerType: "Government",
    date: "2025-04-03",
    items: [
      {
        id: "SI002",
        saleId: "2",
        itemId: "IT002",
        itemName: "Ricoh MP2014 Drum Unit",
        quantity: 5,
        unitPrice: 3200,
        taxRate: 12,
        discount: 500,
        total: 15500
      }
    ],
    subtotal: 16000,
    taxAmount: 1920,
    taxType: "GST",
    discount: 500,
    total: 17420,
    paymentStatus: "Pending",
    amountPaid: 0,
    amountDue: 17420,
    notes: "Government tender",
    status: "Confirmed",
    warehouseId: "W001",
    createdBy: "Admin",
    createdAt: "2025-04-03T14:15:00",
    updatedAt: "2025-04-03T14:15:00",
    stockDeducted: false
  },
  {
    id: "3",
    invoiceNo: "INV-2025-0003",
    customerId: "C003",
    customerName: "XYZ Distributors",
    customerType: "Dealer",
    date: "2025-04-05",
    items: [
      {
        id: "SI003",
        saleId: "3",
        itemId: "IT003",
        itemName: "Xerox 7845 Toner Cyan",
        quantity: 10,
        unitPrice: 4800,
        taxRate: 18,
        discount: 5000,
        total: 43000
      }
    ],
    subtotal: 48000,
    taxAmount: 8640,
    taxType: "GST",
    discount: 5000,
    total: 51640,
    paymentStatus: "Partial",
    paymentMethod: "Check",
    amountPaid: 25000,
    amountDue: 26640,
    notes: "Bulk order discount",
    status: "Confirmed",
    warehouseId: "W001",
    createdBy: "Admin",
    createdAt: "2025-04-05T09:45:00",
    updatedAt: "2025-04-05T09:45:00",
    stockDeducted: false
  }
];

// Sample inventory items for demonstration
const inventoryItems = [
  {
    id: "IT001",
    name: "Kyocera 2554ci Toner Black",
    currentQuantity: 8,
    warehouseId: "W001"
  },
  {
    id: "IT002",
    name: "Ricoh MP2014 Drum Unit",
    currentQuantity: 5,
    warehouseId: "W001"
  },
  {
    id: "IT003",
    name: "Xerox 7845 Toner Cyan",
    currentQuantity: 15,
    warehouseId: "W001"
  }
];

// Define the type for selected items with the total property
type SelectedItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  taxRate: number;
  total?: number; // Add total as optional property
};

const InventorySales = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [sales, setSales] = useState<Sale[]>(sampleSales);
  const [items, setItems] = useState(inventoryItems);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isDeductStockDialogOpen, setIsDeductStockDialogOpen] = useState(false);
  const [saleToDeduct, setSaleToDeduct] = useState<Sale | null>(null);
  
  // Filter sales based on active tab, search query, and filters
  const filteredSales = sales.filter(sale => {
    // Filter by search query
    const matchesSearch = 
      searchQuery === "" || 
      sale.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by customer type
    const matchesCustomerType = 
      customerTypeFilter === "all" || 
      sale.customerType === customerTypeFilter;
    
    // Filter by status
    const matchesStatus = 
      statusFilter === "all" || 
      sale.status === statusFilter;
    
    // Filter by payment status
    const matchesPaymentStatus = 
      paymentStatusFilter === "all" || 
      sale.paymentStatus === paymentStatusFilter;
    
    // Tab filters
    if (activeTab === "all") {
      return matchesSearch && matchesCustomerType && matchesStatus && matchesPaymentStatus;
    } else if (activeTab === "pending") {
      return matchesSearch && matchesCustomerType && matchesStatus && sale.paymentStatus === "Pending";
    } else if (activeTab === "completed") {
      return matchesSearch && matchesCustomerType && matchesStatus && sale.paymentStatus === "Completed";
    } else if (activeTab === "partial") {
      return matchesSearch && matchesCustomerType && matchesStatus && sale.paymentStatus === "Partial";
    }
    
    return false;
  });
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, customerTypeFilter, statusFilter, paymentStatusFilter, activeTab]);
  
  // Function to get status badge variant
  const getStatusBadgeVariant = (status: SaleStatus) => {
    switch (status) {
      case "Draft":
        return "secondary";
      case "Confirmed":
        return "primary";
      case "Delivered":
        return "success";
      case "Cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };
  
  // Function to get payment status badge variant
  const getPaymentStatusBadgeVariant = (status: PaymentStatus) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Partial":
        return "secondary";
      case "Completed":
        return "success";
      default:
        return "secondary";
    }
  };
  
  // Function to get customer type icon
  const getCustomerTypeIcon = (type: CustomerType) => {
    switch (type) {
      case "Regular":
        return <Users className="h-4 w-4 mr-1" />;
      case "Dealer":
        return <Building className="h-4 w-4 mr-1" />;
      case "Government":
        return <UserCheck className="h-4 w-4 mr-1" />;
      default:
        return <Users className="h-4 w-4 mr-1" />;
    }
  };
  
  // Function to handle exporting data
  const handleExportData = () => {
    toast.success("Sales data exported successfully");
  };
  
  // Function to handle printing invoice
  const handlePrintInvoice = (invoiceNo: string) => {
    toast.success(`Printing invoice ${invoiceNo}`);
  };
  
  // Function to handle view sale details
  const handleViewSaleDetails = (saleId: string) => {
    toast.info(`Viewing details for sale ${saleId}`);
    // In a real app, navigate to a detail page
    // navigate(`/inventory/sales/${saleId}`);
  };

  // Function to handle adding an item to the selected items
  const handleAddItem = () => {
    setSelectedItems([
      ...selectedItems,
      {
        id: "",
        name: "",
        quantity: 1,
        price: 0,
        discount: 0,
        taxRate: 18,
      },
    ]);
  };

  // Function to handle removing an item from the selected items
  const handleRemoveItem = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  // Function to handle updating an item in the selected items
  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItems = [...selectedItems];
    (newItems[index] as any)[field] = value;
    
    // If item ID changed, update the name and price
    if (field === "id") {
      const selectedItem = items.find(item => item.id === value);
      if (selectedItem) {
        newItems[index].name = selectedItem.name;
        // In a real app, you would fetch the price from the database
        // For now, let's use a default price
        newItems[index].price = 4500;
      }
    }
    
    // Recalculate total if necessary
    if (["quantity", "price", "discount"].includes(field)) {
      const item = newItems[index];
      const subtotal = item.quantity * item.price;
      const discountAmount = item.discount || 0;
      item.taxRate = item.taxRate || 18; // Default tax rate
      
      // Update the item's total
      newItems[index] = {
        ...item,
        total: subtotal - discountAmount
      };
    }
    
    setSelectedItems(newItems);
  };
  
  // Function to handle creating a new sale
  const handleCreateNewSale = () => {
    // In a real app, this would make an API call to create the sale
    
    // Create a new sale object
    const newSale: Sale = {
      id: `${sales.length + 1}`,
      invoiceNo: `INV-2025-000${sales.length + 1}`,
      customerId: "C001", // Would come from form
      customerName: "Sample Customer", // Would come from form
      customerType: "Regular", // Would come from form
      date: new Date().toISOString().split('T')[0],
      items: selectedItems.map((item, index) => ({
        id: `SI${sales.length + 1}${index}`,
        saleId: `${sales.length + 1}`,
        itemId: item.id,
        itemName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        taxRate: item.taxRate,
        discount: item.discount,
        total: item.quantity * item.price - item.discount
      })),
      subtotal: selectedItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
      taxAmount: selectedItems.reduce((sum, item) => {
        const subtotal = item.quantity * item.price - item.discount;
        return sum + (subtotal * item.taxRate / 100);
      }, 0),
      taxType: "GST",
      discount: selectedItems.reduce((sum, item) => sum + item.discount, 0),
      total: selectedItems.reduce((sum, item) => {
        const subtotal = item.quantity * item.price - item.discount;
        return sum + subtotal + (subtotal * item.taxRate / 100);
      }, 0),
      paymentStatus: "Pending", // Would come from form
      amountPaid: 0, // Would come from form
      amountDue: selectedItems.reduce((sum, item) => {
        const subtotal = item.quantity * item.price - item.discount;
        return sum + subtotal + (subtotal * item.taxRate / 100);
      }, 0),
      status: "Confirmed",
      warehouseId: "W001", // Would come from form
      createdBy: "Admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stockDeducted: false // New sale, stock not deducted yet
    };
    
    // Update sales state
    setSales([...sales, newSale]);
    
    // Close modal and reset form
    setIsNewSaleModalOpen(false);
    setSelectedItems([]);
    
    toast.success("New sale created successfully!");
  };

  // Function to deduct stock for a sale
  const handleDeductStock = (sale: Sale) => {
    if (sale.stockDeducted) {
      toast.warning("Stock has already been deducted for this sale!");
      return;
    }
    
    setSaleToDeduct(sale);
    setIsDeductStockDialogOpen(true);
  };

  // Function to confirm stock deduction
  const confirmDeductStock = () => {
    if (!saleToDeduct) return;
    
    // Update inventory items (deduct stock)
    const updatedItems = [...items];
    
    // Check if we have enough stock for all items
    const notEnoughStock = saleToDeduct.items.some(saleItem => {
      const inventoryItem = updatedItems.find(item => item.id === saleItem.itemId);
      return !inventoryItem || inventoryItem.currentQuantity < saleItem.quantity;
    });
    
    if (notEnoughStock) {
      toast.error("Not enough stock available for one or more items!");
      setIsDeductStockDialogOpen(false);
      return;
    }
    
    // Deduct stock for each item in the sale
    saleToDeduct.items.forEach(saleItem => {
      const inventoryItemIndex = updatedItems.findIndex(item => item.id === saleItem.itemId);
      if (inventoryItemIndex !== -1) {
        updatedItems[inventoryItemIndex] = {
          ...updatedItems[inventoryItemIndex],
          currentQuantity: updatedItems[inventoryItemIndex].currentQuantity - saleItem.quantity
        };
      }
    });
    
    // Update sale to mark stock as deducted
    const updatedSales = sales.map(sale => 
      sale.id === saleToDeduct.id 
        ? { ...sale, stockDeducted: true, updatedAt: new Date().toISOString() }
        : sale
    );
    
    // Update state
    setItems(updatedItems);
    setSales(updatedSales);
    setIsDeductStockDialogOpen(false);
    
    // In a real app, this would also create stock history records
    
    toast.success("Stock deducted successfully!");
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sales Management</h1>
          <p className="text-muted-foreground">Manage sales to customers, dealers, and government entities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isNewSaleModalOpen} onOpenChange={setIsNewSaleModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Create New Sale</DialogTitle>
                <DialogDescription>
                  Enter the details for the new sale. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Type</label>
                  <Select defaultValue="Regular">
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Regular Customer</SelectItem>
                      <SelectItem value="Dealer">Dealer</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="c1">ABC Corporation</SelectItem>
                      <SelectItem value="c2">XYZ Distributors</SelectItem>
                      <SelectItem value="c3">MP Government Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Date</label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Number</label>
                  <Input placeholder="INV-2025-0004" defaultValue="INV-2025-0004" readOnly />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Sale Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="w-[100px]">Quantity</TableHead>
                      <TableHead className="w-[100px]">Price</TableHead>
                      <TableHead className="w-[100px]">Discount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No items added yet. Click "Add Item" below to start.
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={item.id || undefined}
                              onValueChange={(value) => handleUpdateItem(index, "id", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select item" />
                              </SelectTrigger>
                              <SelectContent>
                                {items.map((inventoryItem) => (
                                  <SelectItem key={inventoryItem.id} value={inventoryItem.id}>
                                    {inventoryItem.name} (Stock: {inventoryItem.currentQuantity})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              min="1" 
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(index, "quantity", parseInt(e.target.value) || 1)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              min="0" 
                              value={item.price}
                              onChange={(e) => handleUpdateItem(index, "price", parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              min="0" 
                              value={item.discount}
                              onChange={(e) => handleUpdateItem(index, "discount", parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{((item.quantity * item.price) - (item.discount || 0)).toLocaleString()}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="ml-2 h-8 w-8"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-red-500">
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    
                    {selectedItems.length > 0 && (
                      <>
                        <TableRow>
                          <TableCell colSpan={3} />
                          <TableCell className="font-medium">Subtotal</TableCell>
                          <TableCell className="text-right">
                            ₹{selectedItems
                              .reduce((sum, item) => sum + (item.quantity * item.price) - (item.discount || 0), 0)
                              .toLocaleString()}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} />
                          <TableCell className="font-medium">Tax (18%)</TableCell>
                          <TableCell className="text-right">
                            ₹{(selectedItems
                              .reduce((sum, item) => {
                                const subtotal = (item.quantity * item.price) - (item.discount || 0);
                                return sum + (subtotal * 0.18);
                              }, 0))
                              .toLocaleString()}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} />
                          <TableCell className="font-medium">Total</TableCell>
                          <TableCell className="text-right font-bold">
                            ₹{(selectedItems
                              .reduce((sum, item) => {
                                const subtotal = (item.quantity * item.price) - (item.discount || 0);
                                return sum + subtotal + (subtotal * 0.18);
                              }, 0))
                              .toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
                
                <Button variant="outline" className="w-full" onClick={handleAddItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Status</label>
                  <Select defaultValue="Pending">
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Online Transfer">Online Transfer</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount Paid</label>
                  <Input type="number" min="0" defaultValue="0" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Input placeholder="Add any additional notes here" />
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsNewSaleModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNewSale}>Create Sale</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-md flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-700">Total Sales</p>
                  <p className="text-2xl font-bold">₹79,680</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-blue-700" />
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-md flex justify-between items-center">
                <div>
                  <p className="text-sm text-green-700">Received</p>
                  <p className="text-2xl font-bold">₹35,620</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-700" />
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-md flex justify-between items-center">
                <div>
                  <p className="text-sm text-amber-700">Pending</p>
                  <p className="text-2xl font-bold">₹44,060</p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-amber-700" />
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-md flex justify-between items-center">
                <div>
                  <p className="text-sm text-purple-700">Total Orders</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Sales History</CardTitle>
          <CardDescription>Manage and view all your sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <TabsList className="mb-2 sm:mb-0">
                <TabsTrigger value="all">All Sales</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="partial">Partial</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by invoice or customer..."
                    className="pl-8 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select 
                  value={customerTypeFilter} 
                  onValueChange={setCustomerTypeFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Customer Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Dealer">Dealer</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <div className="rounded-md border">
                <Table>
                  <TableCaption>
                    {filteredSales.length === 0 ? 
                      'No sales found matching your criteria.' : 
                      'A list of your sales transactions.'}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No results found. Try adjusting your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentItems.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.invoiceNo}</TableCell>
                          <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getCustomerTypeIcon(sale.customerType)}
                              <span>{sale.customerName}</span>
                            </div>
                          </TableCell>
                          <TableCell>₹{sale.total.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(sale.status) as any}>
                              {sale.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPaymentStatusBadgeVariant(sale.paymentStatus) as any}>
                              {sale.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={sale.stockDeducted ? "success" : "warning"} className="whitespace-nowrap">
                              {sale.stockDeducted ? "Deducted" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="12" cy="5" r="1" />
                                    <circle cx="12" cy="19" r="1" />
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewSaleDetails(sale.id)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePrintInvoice(sale.invoiceNo)}>
                                  Print Invoice
                                </DropdownMenuItem>
                                {!sale.stockDeducted && (
                                  <DropdownMenuItem onClick={() => handleDeductStock(sale)}>
                                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                                    Deduct Stock
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Cancel Sale
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
              {/* Similar table structure as "all" tab but filtered for pending payment status */}
              <div className="rounded-md border">
                <Table>
                  <TableCaption>Sales with pending payment.</TableCaption>
                  {/* Same table header and structure as above */}
                  {/* This content will be automatically filtered by the activeTab state */}
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="partial" className="mt-0">
              {/* Similar table structure as "all" tab but filtered for partial payment status */}
              <div className="rounded-md border">
                <Table>
                  <TableCaption>Sales with partial payment.</TableCaption>
                  {/* Same table header and structure as above */}
                  {/* This content will be automatically filtered by the activeTab state */}
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              {/* Similar table structure as "all" tab but filtered for completed payment status */}
              <div className="rounded-md border">
                <Table>
                  <TableCaption>Sales with completed payment.</TableCaption>
                  {/* Same table header and structure as above */}
                  {/* This content will be automatically filtered by the activeTab state */}
                </Table>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Pagination */}
          {filteredSales.length > 0 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    const showPage = pageNumber === 1 || 
                                    pageNumber === totalPages || 
                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                    
                    if (!showPage) {
                      if (pageNumber === 2 || pageNumber === totalPages - 1) {
                        return (
                          <PaginationItem key={`ellipsis-${pageNumber}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    }
                    
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          isActive={pageNumber === currentPage}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Stock Deduction Confirmation Dialog */}
      <Dialog open={isDeductStockDialogOpen} onOpenChange={setIsDeductStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deduct Stock</DialogTitle>
            <DialogDescription>
              Are you sure you want to deduct stock for this sale? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {saleToDeduct && (
            <div className="py-4">
              <h3 className="font-medium mb-2">Items to deduct:</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>After Deduction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saleToDeduct.items.map((item) => {
                      const inventoryItem = items.find(i => i.id === item.itemId);
                      const currentStock = inventoryItem ? inventoryItem.currentQuantity : 0;
                      const afterDeduction = currentStock - item.quantity;
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{currentStock}</TableCell>
                          <TableCell>
                            <span className={afterDeduction < 0 ? "text-red-500 font-bold" : ""}>
                              {afterDeduction}
                              {afterDeduction < 0 && " (Not enough stock!)"}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeductStockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmDeductStock}>
              Confirm Deduction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventorySales;
