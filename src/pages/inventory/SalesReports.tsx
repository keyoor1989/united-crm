
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, FileText, Banknote } from "lucide-react";
import { toast } from "sonner";

// Import existing components
import { SalesHeader } from "@/components/inventory/sales/SalesHeader";
import { SalesFilters } from "@/components/inventory/sales/SalesFilters";
import { SalesTable, SalesItem } from "@/components/inventory/sales/SalesTable";
import { SaleDetailsDialog } from "@/components/inventory/sales/SaleDetailsDialog";
import { RecordPaymentDialog } from "@/components/inventory/sales/RecordPaymentDialog";
import { useSalesManagement } from "@/components/inventory/sales/hooks/useSalesManagement";

// Mock data for sales reports
const allSalesData = [
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

// Payment methods for the payment dialog
const paymentMethods = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "credit_card", label: "Credit Card", icon: FileText }
];

const SalesReports = () => {
  // Use the custom hook with all sales data
  const {
    filteredSalesData,
    searchQuery,
    setSearchQuery,
    paymentFilter,
    setPaymentFilter,
    statusFilter,
    setStatusFilter,
    customerTypeFilter,
    setCustomerTypeFilter,
    resetFilters,
    generateBill,
    recordPayment,
    exportSalesData,
  } = useSalesManagement(allSalesData);

  // State for dialog visibility
  const [isSaleDetailsDialogOpen, setIsSaleDetailsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SalesItem | null>(null);

  // Handle view details
  const handleViewDetails = (sale: SalesItem) => {
    setSelectedSale(sale);
    setIsSaleDetailsDialogOpen(true);
  };

  // Handle printing invoice
  const handlePrintInvoice = (sale: SalesItem) => {
    toast.success(`Printing invoice #${sale.invoiceNumber} for ${sale.customer}`);
  };

  // Handle opening payment dialog
  const handleOpenPaymentDialog = (sale: SalesItem) => {
    setSelectedSale(sale);
    setIsPaymentDialogOpen(true);
  };

  // Calculate summary statistics
  const totalSales = filteredSalesData.reduce((sum, sale) => sum + sale.total, 0);
  const totalPaid = filteredSalesData.reduce((sum, sale) => 
    sale.paymentStatus === "Paid" ? sum + sale.total : sum, 0);
  const totalOutstanding = filteredSalesData.reduce((sum, sale) => 
    sale.paymentStatus === "Due" || sale.paymentStatus === "Pending" ? sum + sale.total : sum, 0);

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Sales Reports | Inventory Management</title>
      </Helmet>

      {/* Header with title and action buttons */}
      <SalesHeader 
        onNewSale={() => toast.info("Sales reporting is read-only")} 
        onExportData={exportSalesData} 
      />

      {/* Sales Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {filteredSalesData.length} transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalPaid / totalSales) * 100).toFixed(1)}% of total sales
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalOutstanding / totalSales) * 100).toFixed(1)}% of total sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <Tabs defaultValue="sales-report" className="w-full">
        <TabsList>
          <TabsTrigger value="sales-report" className="gap-2">
            <BarChart size={16} />
            Sales Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales-report" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Report</CardTitle>
              <CardDescription>
                View and analyze all sales transactions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filters */}
              <SalesFilters 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                paymentFilter={paymentFilter}
                onPaymentFilterChange={setPaymentFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                customerTypeFilter={customerTypeFilter}
                onCustomerTypeFilterChange={setCustomerTypeFilter}
                onResetFilters={resetFilters}
              />

              {/* Sales table */}
              <SalesTable 
                salesData={filteredSalesData}
                onGenerateBill={generateBill}
                onPrintInvoice={handlePrintInvoice}
                onViewDetails={handleViewDetails}
                onRecordPayment={handleOpenPaymentDialog}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SaleDetailsDialog 
        open={isSaleDetailsDialogOpen}
        onClose={() => setIsSaleDetailsDialogOpen(false)}
        sale={selectedSale}
        onGenerateBill={generateBill}
        onPrintInvoice={handlePrintInvoice}
        onRecordPayment={handleOpenPaymentDialog}
      />
      
      <RecordPaymentDialog 
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        sale={selectedSale}
        paymentMethods={paymentMethods}
        onSavePayment={recordPayment}
      />
    </div>
  );
};

export default SalesReports;
