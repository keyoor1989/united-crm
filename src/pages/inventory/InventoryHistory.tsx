import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  History, 
  Search, 
  Filter,
  FileDown,
  Eye,
  FileText,
  Warehouse
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Sample history data
const stockHistoryData = [
  {
    id: "1",
    itemName: "Kyocera 2554ci Toner Black",
    brand: "Kyocera",
    model: "2554ci",
    transactionType: "Purchase" as const,
    quantity: 5,
    balanceAfter: 5,
    date: "2025-04-01",
    reference: "PO-2554-001",
    warehouse: "Main Warehouse",
    warehouseId: "1",
    remarks: "Initial stock purchase",
  },
  {
    id: "2",
    itemName: "Kyocera 2554ci Toner Black",
    brand: "Kyocera",
    model: "2554ci",
    transactionType: "Issue" as const,
    quantity: -1,
    balanceAfter: 4,
    date: "2025-04-02",
    reference: "IS-2554-001",
    warehouse: "Main Warehouse",
    warehouseId: "1",
    remarks: "Issued to Rahul Verma (Engineer)",
  },
  {
    id: "3",
    itemName: "Kyocera 2554ci Toner Black",
    brand: "Kyocera",
    model: "2554ci",
    transactionType: "Issue" as const,
    quantity: -1,
    balanceAfter: 3,
    date: "2025-04-03",
    reference: "IS-2554-002",
    warehouse: "Main Warehouse",
    warehouseId: "1",
    remarks: "Issued to ABC Technologies (Customer)",
  },
  {
    id: "4",
    itemName: "Ricoh MP2014 Drum Unit",
    brand: "Ricoh",
    model: "MP2014",
    transactionType: "Purchase" as const,
    quantity: 3,
    balanceAfter: 3,
    date: "2025-04-03",
    reference: "PO-MP2014-001",
    warehouse: "Main Warehouse",
    warehouseId: "1",
    remarks: "New stock purchase",
  },
  {
    id: "5",
    itemName: "Ricoh MP2014 Drum Unit",
    brand: "Ricoh",
    model: "MP2014",
    transactionType: "Issue" as const,
    quantity: -1,
    balanceAfter: 2,
    date: "2025-04-04",
    reference: "IS-MP2014-001",
    warehouse: "Main Warehouse",
    warehouseId: "1",
    remarks: "Issued to Deepak Kumar (Engineer)",
  },
  {
    id: "6",
    itemName: "Canon 2525 Drum Unit",
    brand: "Canon",
    model: "2525",
    transactionType: "Purchase" as const,
    quantity: 4,
    balanceAfter: 4,
    date: "2025-04-04",
    reference: "PO-2525-001",
    warehouse: "Bhopal Warehouse",
    warehouseId: "2",
    remarks: "New stock purchase",
  },
  {
    id: "7",
    itemName: "Canon 2525 Drum Unit",
    brand: "Canon",
    model: "2525",
    transactionType: "Transfer" as const,
    quantity: -2,
    balanceAfter: 2,
    date: "2025-04-05",
    reference: "TR-2525-001",
    warehouse: "Bhopal Warehouse",
    warehouseId: "2",
    remarks: "Transferred to Main Warehouse",
  },
  {
    id: "8",
    itemName: "HP M428 Toner",
    brand: "HP",
    model: "M428",
    transactionType: "Purchase" as const,
    quantity: 8,
    balanceAfter: 8,
    date: "2025-04-06",
    reference: "PO-M428-001",
    warehouse: "Jabalpur Storage",
    warehouseId: "3",
    remarks: "Bulk purchase",
  },
  {
    id: "9",
    itemName: "HP M428 Toner",
    brand: "HP",
    model: "M428",
    transactionType: "Issue" as const,
    quantity: -1,
    balanceAfter: 7,
    date: "2025-04-07",
    reference: "IS-M428-001",
    warehouse: "Jabalpur Storage",
    warehouseId: "3",
    remarks: "Issued to XYZ Solutions (Customer)",
  },
  {
    id: "10",
    itemName: "Xerox 7845 Toner Cyan",
    brand: "Xerox",
    model: "7845",
    transactionType: "Return" as const,
    quantity: 1,
    balanceAfter: 1,
    date: "2025-04-08",
    reference: "RT-7845-001",
    warehouse: "Main Warehouse",
    warehouseId: "1",
    remarks: "Returned by Tech Innovations (damaged goods replaced)",
  },
];

// Sample filter options
const brands = ["All", "Kyocera", "Ricoh", "Canon", "HP", "Xerox"];
const transactionTypes = ["All", "Purchase", "Issue", "Transfer", "Return"];
const warehouses = ["All", "Main Warehouse", "Bhopal Warehouse", "Jabalpur Storage"];

const InventoryHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [warehouseFilter, setWarehouseFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [viewItemDetails, setViewItemDetails] = useState<any>(null);
  
  // Filter history data based on search and filters
  const filteredHistory = stockHistoryData.filter((item) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Brand filter
    const matchesBrand = brandFilter === "All" || item.brand === brandFilter;
    
    // Transaction type filter
    const matchesType = typeFilter === "All" || item.transactionType === typeFilter;
    
    // Warehouse filter
    const matchesWarehouse = warehouseFilter === "All" || item.warehouse === warehouseFilter;
    
    // Date filter
    const matchesDate = !dateFilter || 
      format(new Date(item.date), "yyyy-MM-dd") === format(dateFilter, "yyyy-MM-dd");
    
    return matchesSearch && matchesBrand && matchesType && matchesWarehouse && matchesDate;
  });
  
  // Function to get badge variant based on transaction type
  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case "Purchase":
        return "success";
      case "Issue":
        return "destructive";
      case "Transfer":
        return "warning";
      case "Return":
        return "secondary";
      default:
        return "default";
    }
  };
  
  // Function to get icon based on transaction type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "Purchase":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case "Issue":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "Transfer":
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
      case "Return":
        return <ArrowDownLeft className="h-4 w-4 text-purple-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setBrandFilter("All");
    setTypeFilter("All");
    setWarehouseFilter("All");
    setDateFilter(undefined);
  };

  // Export to CSV function
  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Item Name", "Brand", "Model", "Transaction Type", "Quantity", "Balance", "Date", "Reference", "Warehouse", "Remarks"];
    const rows = filteredHistory.map(item => [
      item.itemName,
      item.brand,
      item.model,
      item.transactionType,
      item.quantity,
      item.balanceAfter,
      item.date,
      item.reference,
      item.warehouse,
      item.remarks
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stock-history-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Stock history exported successfully");
  };

  // View item details
  const handleViewDetails = (item: any) => {
    setViewItemDetails(item);
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Stock History</h1>
          <p className="text-muted-foreground">View complete inventory history for all items</p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <FileDown size={16} />
          Export CSV
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter size={18} />
            Filter Options
          </CardTitle>
          <CardDescription>
            Narrow down results by specific criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search input */}
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by item or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            {/* Brand filter */}
            <div className="space-y-2">
              <label htmlFor="brand-filter" className="text-sm font-medium">
                Brand
              </label>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger id="brand-filter">
                  <SelectValue placeholder="Filter by brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Transaction type filter */}
            <div className="space-y-2">
              <label htmlFor="type-filter" className="text-sm font-medium">
                Transaction Type
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Warehouse filter */}
            <div className="space-y-2">
              <label htmlFor="warehouse-filter" className="text-sm font-medium">
                Warehouse
              </label>
              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger id="warehouse-filter">
                  <SelectValue placeholder="Filter by warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse} value={warehouse}>
                      {warehouse}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Date filter */}
            <div className="space-y-2">
              <label htmlFor="date-filter" className="text-sm font-medium">
                Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="date-filter"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={resetFilters} className="gap-2">
              <History size={16} />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%]">Item</TableHead>
                  <TableHead>Brand / Model</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No stock history found with the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell>{item.brand} / {item.model}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(item.transactionType)}
                          <Badge variant={getTransactionBadgeVariant(item.transactionType) as any}>
                            {item.transactionType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        item.quantity > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                      </TableCell>
                      <TableCell className="text-right">{item.balanceAfter}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Warehouse className="h-3.5 w-3.5 text-muted-foreground" />
                          {item.warehouse}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.reference}</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewDetails(item)} 
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!viewItemDetails} onOpenChange={() => setViewItemDetails(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={18} />
              Transaction Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this inventory transaction
            </DialogDescription>
          </DialogHeader>
          
          {viewItemDetails && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Item Name</h4>
                  <p className="font-medium">{viewItemDetails.itemName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Brand / Model</h4>
                  <p>{viewItemDetails.brand} / {viewItemDetails.model}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Transaction Type</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getTransactionIcon(viewItemDetails.transactionType)}
                    <Badge variant={getTransactionBadgeVariant(viewItemDetails.transactionType) as any}>
                      {viewItemDetails.transactionType}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                  <p>{viewItemDetails.date}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Quantity Change</h4>
                  <p className={viewItemDetails.quantity > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {viewItemDetails.quantity > 0 ? `+${viewItemDetails.quantity}` : viewItemDetails.quantity}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Balance After</h4>
                  <p className="font-medium">{viewItemDetails.balanceAfter}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Warehouse</h4>
                <div className="flex items-center gap-1 mt-1">
                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                  <span>{viewItemDetails.warehouse}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Reference</h4>
                <p className="font-mono">{viewItemDetails.reference}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Remarks</h4>
                <p className="text-sm">{viewItemDetails.remarks}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryHistory;
