import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Plus, 
  ShoppingCart, 
  Check, 
  X, 
  Calendar, 
  MoreHorizontal, 
  PackageCheck, 
  FileText, 
  Printer,
  ArrowDown,
  Ban
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  CustomerType, 
  Sale, 
  SaleItem, 
  PaymentStatus, 
  PaymentMethod, 
  SaleStatus, 
  TaxType,
  InventoryItem,
  Brand,
  Model
} from "@/types/inventory";
import { Checkbox } from "@/components/ui/checkbox";
import ItemSelector from "@/components/inventory/ItemSelector";

// Sample data
const sampleSales: Sale[] = [
  {
    id: "1",
    invoiceNo: "INV-2025001",
    customerId: "CUST-1001",
    customerName: "ABC Technologies",
    customerType: "Regular",
    date: "2025-04-08",
    items: [
      {
        id: "1",
        saleId: "1",
        itemId: "1",
        itemName: "Kyocera 2554ci Toner Black",
        quantity: 2,
        unitPrice: 5200,
        taxRate: 0,
        discount: 0,
        total: 10400,
      },
    ],
    subtotal: 10400,
    taxAmount: 0,
    taxType: "Non-GST",
    discount: 0,
    total: 10400,
    paymentStatus: "Completed",
    paymentMethod: "Cash",
    amountPaid: 10400,
    amountDue: 0,
    notes: "First sale of the month",
    status: "Delivered",
    warehouseId: "1",
    createdBy: "Admin",
    createdAt: "2025-04-08",
    updatedAt: "2025-04-08",
    stockDeducted: true
  },
  {
    id: "2",
    invoiceNo: "INV-2025002",
    customerId: "CUST-1002",
    customerName: "XYZ Solutions",
    customerType: "Dealer",
    date: "2025-04-07",
    items: [
      {
        id: "2",
        saleId: "2",
        itemId: "2",
        itemName: "Canon 2525 Drum Unit",
        quantity: 1,
        unitPrice: 8500,
        taxRate: 0,
        discount: 5,
        total: 8075,
      },
    ],
    subtotal: 8500,
    taxAmount: 0,
    taxType: "Non-GST",
    discount: 5,
    total: 8075,
    paymentStatus: "Partial",
    paymentMethod: "Online Transfer",
    amountPaid: 5000,
    amountDue: 3075,
    notes: "Dealer discount applied",
    status: "Confirmed",
    warehouseId: "1",
    createdBy: "Admin",
    createdAt: "2025-04-07",
    updatedAt: "2025-04-07",
    stockDeducted: false
  },
  {
    id: "3",
    invoiceNo: "INV-2025003",
    customerId: "CUST-1003",
    customerName: "Government Printing Press",
    customerType: "Government",
    date: "2025-04-05",
    items: [
      {
        id: "3",
        saleId: "3",
        itemId: "3",
        itemName: "HP M428 Toner",
        quantity: 3,
        unitPrice: 2800,
        taxRate: 18,
        discount: 10,
        total: 7568.4,
      },
    ],
    subtotal: 8400,
    taxAmount: 1274.4,
    taxType: "GST",
    discount: 10,
    total: 7568.4,
    paymentStatus: "Pending",
    paymentMethod: "Check",
    amountPaid: 0,
    amountDue: 7568.4,
    notes: "Government order, check payment",
    status: "Draft",
    warehouseId: "1",
    createdBy: "Admin",
    createdAt: "2025-04-05",
    updatedAt: "2025-04-05",
    stockDeducted: false
  },
];

const mockBrands: Brand[] = [
  { id: "1", name: "Kyocera", createdAt: "2025-03-01" },
  { id: "2", name: "Ricoh", createdAt: "2025-03-02" },
  { id: "3", name: "Xerox", createdAt: "2025-03-03" },
  { id: "4", name: "Canon", createdAt: "2025-03-04" },
  { id: "5", name: "HP", createdAt: "2025-03-05" }
];

const mockModels: Model[] = [
  { id: "1", brandId: "1", name: "2554ci", type: "Machine", createdAt: "2025-03-01" },
  { id: "2", brandId: "2", name: "MP2014", type: "Machine", createdAt: "2025-03-02" },
  { id: "3", brandId: "3", name: "7845", type: "Machine", createdAt: "2025-03-03" },
  { id: "4", brandId: "4", name: "2525", type: "Machine", createdAt: "2025-03-04" },
  { id: "5", brandId: "5", name: "M428", type: "Machine", createdAt: "2025-03-05" }
];

const inventoryItems: InventoryItem[] = [
  { 
    id: "1", 
    modelId: "1", 
    brandId: "1", 
    name: "Kyocera 2554ci Toner Black", 
    type: "Toner", 
    minQuantity: 5, 
    currentQuantity: 12, 
    lastPurchasePrice: 5200, 
    lastVendor: "Copier Zone", 
    barcode: "KYO2554-BT001", 
    createdAt: "2025-03-10" 
  },
  { 
    id: "2", 
    modelId: "4", 
    brandId: "4", 
    name: "Canon 2525 Drum Unit", 
    type: "Drum", 
    minQuantity: 2, 
    currentQuantity: 3, 
    lastPurchasePrice: 8500, 
    lastVendor: "Toner World", 
    barcode: "CAN2525-DU001", 
    createdAt: "2025-03-11" 
  },
  { 
    id: "3", 
    modelId: "5", 
    brandId: "5", 
    name: "HP M428 Toner", 
    type: "Toner", 
    minQuantity: 3, 
    currentQuantity: 7, 
    lastPurchasePrice: 2800, 
    lastVendor: "HP Store", 
    barcode: "HP428-T001", 
    createdAt: "2025-03-12" 
  },
  { 
    id: "4", 
    modelId: "2", 
    brandId: "2", 
    name: "Ricoh MP2014 Developer", 
    type: "Developer", 
    minQuantity: 4, 
    currentQuantity: 5, 
    lastPurchasePrice: 4100, 
    lastVendor: "Ricoh Systems", 
    barcode: "RIC2014-D001", 
    createdAt: "2025-03-13" 
  },
  { 
    id: "5", 
    modelId: "3", 
    brandId: "3", 
    name: "Xerox 7845 Fuser Film", 
    type: "Fuser", 
    minQuantity: 1, 
    currentQuantity: 2, 
    lastPurchasePrice: 9200, 
    lastVendor: "Xerox Parts", 
    barcode: "XER7845-FF001", 
    createdAt: "2025-03-14" 
  },
];

// Define the type for selected items with the total property
type SelectedItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  taxRate: number;
  total?: number; // This resolves the error
};

const InventorySales = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [date, setDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerType, setSelectedCustomerType] = useState<CustomerType | "">("");
  const [selectedStatus, setSelectedStatus] = useState<SaleStatus | "">("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus | "">("");
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [sales, setSales] = useState<Sale[]>(sampleSales);
  const [items, setItems] = useState(inventoryItems);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isDeductStockDialogOpen, setIsDeductStockDialogOpen] = useState(false);
  const [saleToDeduct, setSaleToDeduct] = useState<Sale | null>(null);
  
  // Form state for new sale
  const [saleForm, setSaleForm] = useState({
    customerType: "Regular" as CustomerType,
    customerId: "",
    customerName: "",
    taxType: "GST" as TaxType,
    discount: 0,
    notes: "",
    paymentMethod: "Cash" as PaymentMethod,
    amountPaid: 0,
    warehouseId: "1", // Default warehouse
    warehouseName: "Main Warehouse"
  });

  // New state for handling item selection
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemDiscount, setItemDiscount] = useState<number>(0);
  
  // Handle item selection from the ItemSelector component
  const handleItemSelected = (item: InventoryItem) => {
    setSelectedItem(item);
  };
  
  // Add selected item to the sale
  const handleAddItemToSale = () => {
    if (!selectedItem) {
      toast.warning("Please select an item first");
      return;
    }
    
    if (itemQuantity <= 0) {
      toast.warning("Quantity must be greater than 0");
      return;
    }
    
    // Check if the item already exists in the selected items
    const existingItemIndex = selectedItems.findIndex(item => item.id === selectedItem.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += itemQuantity;
      updatedItems[existingItemIndex].discount = itemDiscount;
      const subtotal = selectedItem.lastPurchasePrice * updatedItems[existingItemIndex].quantity;
      const discountAmount = (subtotal * itemDiscount) / 100;
      updatedItems[existingItemIndex].total = subtotal - discountAmount + (subtotal - discountAmount) * (saleForm.taxType === "GST" ? 0.18 : 0);
      setSelectedItems(updatedItems);
    } else {
      // Add new item
      const subtotal = selectedItem.lastPurchasePrice * itemQuantity;
      const discountAmount = (subtotal * itemDiscount) / 100;
      const newSelectedItem: SelectedItem = {
        id: selectedItem.id,
        name: selectedItem.name,
        quantity: itemQuantity,
        price: selectedItem.lastPurchasePrice,
        discount: itemDiscount,
        taxRate: saleForm.taxType === "GST" ? 18 : 0,
        total: subtotal - discountAmount + (subtotal - discountAmount) * (saleForm.taxType === "GST" ? 0.18 : 0)
      };
      setSelectedItems([...selectedItems, newSelectedItem]);
    }
    
    // Reset item form
    setSelectedItem(null);
    setItemQuantity(1);
    setItemDiscount(0);
    toast.success("Item added to sale");
  };
  
  // Remove item from selected items
  const handleRemoveItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };
  
  // Calculate sale totals
  const calculateSaleTotals = () => {
    const subtotal = selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discountAmount = selectedItems.reduce((total, item) => {
      const itemSubtotal = item.price * item.quantity;
      return total + (itemSubtotal * item.discount / 100);
    }, 0) + (subtotal * saleForm.discount / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = saleForm.taxType === "GST" ? taxableAmount * 0.18 : 0;
    const total = taxableAmount + taxAmount;
    const amountDue = total - saleForm.amountPaid;
    
    return {
      subtotal,
      discountAmount,
      taxAmount,
      total,
      amountDue
    };
  };
  
  // Create a new sale
  const handleCreateSale = () => {
    if (selectedItems.length === 0) {
      toast.warning("Please add at least one item to the sale");
      return;
    }
    
    if (!saleForm.customerName) {
      toast.warning("Please enter customer name");
      return;
    }
    
    const totals = calculateSaleTotals();
    
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
      customerId: saleForm.customerId || `cust-${Date.now()}`,
      customerName: saleForm.customerName,
      customerType: saleForm.customerType,
      date: format(date, 'yyyy-MM-dd'),
      items: selectedItems.map(item => ({
        id: `item-${Date.now()}-${item.id}`,
        saleId: `sale-${Date.now()}`,
        itemId: item.id,
        itemName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        taxRate: item.taxRate,
        discount: item.discount,
        total: (item.price * item.quantity) - ((item.price * item.quantity) * item.discount / 100)
      })),
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      taxType: saleForm.taxType,
      discount: saleForm.discount,
      total: totals.total,
      paymentStatus: totals.amountDue <= 0 ? "Completed" : (saleForm.amountPaid > 0 ? "Partial" : "Pending"),
      paymentMethod: saleForm.paymentMethod,
      amountPaid: saleForm.amountPaid,
      amountDue: totals.amountDue,
      notes: saleForm.notes,
      status: "Confirmed",
      warehouseId: saleForm.warehouseId,
      createdBy: "Current User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stockDeducted: false
    };
    
    setSales([newSale, ...sales]);
    setIsNewSaleModalOpen(false);
    
    // Reset form
    setSelectedItems([]);
    setSaleForm({
      customerType: "Regular",
      customerId: "",
      customerName: "",
      taxType: "GST",
      discount: 0,
      notes: "",
      paymentMethod: "Cash",
      amountPaid: 0,
      warehouseId: "1",
      warehouseName: "Main Warehouse"
    });
    
    toast.success("Sale created successfully");
    
    // Show deduct stock dialog
    setSaleToDeduct(newSale);
    setIsDeductStockDialogOpen(true);
  };
  
  // Handle deducting stock
  const handleDeductStock = () => {
    if (!saleToDeduct) return;
    
    // Check if stock can be deducted
    const canDeduct = saleToDeduct.items.every(saleItem => {
      const inventoryItem = items.find(item => item.id === saleItem.itemId);
      return inventoryItem && inventoryItem.currentQuantity >= saleItem.quantity;
    });
    
    if (!canDeduct) {
      toast.error("Not enough stock for some items");
      setIsDeductStockDialogOpen(false);
      return;
    }
    
    // Deduct stock from inventory
    const updatedItems = items.map(item => {
      const saleItem = saleToDeduct.items.find(si => si.itemId === item.id);
      if (saleItem) {
        return {
          ...item,
          currentQuantity: item.currentQuantity - saleItem.quantity
        };
      }
      return item;
    });
    
    // Update sale status
    const updatedSales = sales.map(sale => {
      if (sale.id === saleToDeduct.id) {
        return {
          ...sale,
          stockDeducted: true
        };
      }
      return sale;
    });
    
    setItems(updatedItems);
    setSales(updatedSales);
    setIsDeductStockDialogOpen(false);
    toast.success("Stock deducted successfully");
  };

  const filterSales = (sale: Sale): boolean => {
    const searchText = searchQuery.toLowerCase();
    const customerTypeFilter = selectedCustomerType;
    const statusFilter = selectedStatus;
    const paymentStatusFilter = selectedPaymentStatus;
  
    const matchesSearch =
      sale.invoiceNo.toLowerCase().includes(searchText) ||
      sale.customerName.toLowerCase().includes(searchText);
  
    const matchesCustomerType =
      !customerTypeFilter || sale.customerType === customerTypeFilter;
  
    const matchesStatus = !statusFilter || sale.status === statusFilter;
  
    const matchesPaymentStatus =
      !paymentStatusFilter || sale.paymentStatus === paymentStatusFilter;
  
    return matchesSearch && matchesCustomerType && matchesStatus && matchesPaymentStatus;
  };

  const filteredSales = sales.filter(filterSales);

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Inventory Sales</h1>
          <p className="text-muted-foreground">
            Manage sales to customers, dealers, and government clients
          </p>
        </div>
        
        <Button onClick={() => setIsNewSaleModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button>
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Select value={selectedCustomerType} onValueChange={(value) => setSelectedCustomerType(value as CustomerType)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by Customer Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Customer Types</SelectItem>
            <SelectItem value="Regular">Regular</SelectItem>
            <SelectItem value="Dealer">Dealer</SelectItem>
            <SelectItem value="Government">Government</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as SaleStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedPaymentStatus} onValueChange={(value) => setSelectedPaymentStatus(value as PaymentStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Payment Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Partial">Partial</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Sales</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.invoiceNo}</TableCell>
                        <TableCell>{sale.customerName}</TableCell>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell>₹{sale.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                              sale.paymentStatus === "Completed" ? "success" :
                              sale.paymentStatus === "Partial" ? "warning" :
                              "destructive"
                            }
                          >
                            {sale.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{sale.status}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => navigate(`/sales/${sale.id}`)}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <PackageCheck className="mr-2 h-4 w-4" />
                                Mark as Delivered
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Invoice
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Ban className="mr-2 h-4 w-4" />
                                Cancel Sale
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="drafts">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales
                      .filter((sale) => sale.status === "Draft")
                      .map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.invoiceNo}</TableCell>
                          <TableCell>{sale.customerName}</TableCell>
                          <TableCell>{sale.date}</TableCell>
                          <TableCell>₹{sale.total.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={
                                sale.paymentStatus === "Completed" ? "success" :
                                sale.paymentStatus === "Partial" ? "warning" :
                                "destructive"
                              }
                            >
                              {sale.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{sale.status}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => navigate(`/sales/${sale.id}`)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <PackageCheck className="mr-2 h-4 w-4" />
                                  Mark as Delivered
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="mr-2 h-4 w-4" />
                                  Print Invoice
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Cancel Sale
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="confirmed">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales
                      .filter((sale) => sale.status === "Confirmed")
                      .map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.invoiceNo}</TableCell>
                          <TableCell>{sale.customerName}</TableCell>
                          <TableCell>{sale.date}</TableCell>
                          <TableCell>₹{sale.total.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={
                                sale.paymentStatus === "Completed" ? "success" :
                                sale.paymentStatus === "Partial" ? "warning" :
                                "destructive"
                              }
                            >
                              {sale.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{sale.status}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => navigate(`/sales/${sale.id}`)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <PackageCheck className="mr-2 h-4 w-4" />
                                  Mark as Delivered
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="mr-2 h-4 w-4" />
                                  Print Invoice
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Cancel Sale
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="delivered">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales
                      .filter((sale) => sale.status === "Delivered")
                      .map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.invoiceNo}</TableCell>
                          <TableCell>{sale.customerName}</TableCell>
                          <TableCell>{sale.date}</TableCell>
                          <TableCell>₹{sale.total.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={
                                sale.paymentStatus === "Completed" ? "success" :
                                sale.paymentStatus === "Partial" ? "warning" :
                                "destructive"
