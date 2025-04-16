
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

// Import existing components
import { SalesHeader } from "@/components/inventory/sales/SalesHeader";
import { SalesFilters } from "@/components/inventory/sales/SalesFilters";
import { SalesTable, SalesItem } from "@/components/inventory/sales/SalesTable";
import { useSalesManagement } from "@/components/inventory/sales/hooks/useSalesManagement";
import { formatCurrency } from "@/utils/finance/financeUtils";

// Mock data for credit sales
const creditSalesData = [
  {
    id: "CS001",
    date: "2025-04-10",
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
    dueDate: "2025-05-10"
  },
  {
    id: "CS002",
    date: "2025-04-05",
    customer: "Tech Solutions",
    customerType: "Dealer",
    itemName: "Kyocera TK-1175 Toner",
    quantity: 10,
    unitPrice: 2200,
    total: 22000,
    status: "Credit Sale",
    paymentMethod: "Credit",
    paymentStatus: "Due",
    billGenerated: true,
    invoiceNumber: "INV-2025-005",
    dueDate: "2025-05-05"
  },
  {
    id: "CS003",
    date: "2025-03-25",
    customer: "City Hospital",
    customerType: "Government",
    itemName: "Canon NPG-59 Drum",
    quantity: 2,
    unitPrice: 4200,
    total: 8400,
    status: "Credit Sale",
    paymentMethod: "Credit",
    paymentStatus: "Partial",
    billGenerated: true,
    invoiceNumber: "INV-2025-003",
    dueDate: "2025-04-25"
  }
];

const CreditSales = () => {
  // Use the custom hook with filtered data (only credit sales)
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
  } = useSalesManagement(creditSalesData);

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

  // Calculate total due amount
  const totalDueAmount = filteredSalesData.reduce((sum, sale) => {
    if (sale.paymentStatus === "Due") {
      return sum + sale.total;
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header with title and action buttons */}
      <SalesHeader 
        onNewSale={() => toast.info("Credit sale functionality will be available soon")} 
        onExportData={exportSalesData} 
      />

      {/* Credit Sales Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Credit Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDueAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Amount pending from {filteredSalesData.length} customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDueAmount * 0.6)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Payments due in next 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalDueAmount * 0.2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Payments overdue by more than 15 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <Tabs defaultValue="credit-sales" className="w-full">
        <TabsList>
          <TabsTrigger value="credit-sales" className="gap-2">
            <CreditCard size={16} />
            Credit Sales
          </TabsTrigger>
          {/* Additional tabs can be added here */}
        </TabsList>

        <TabsContent value="credit-sales" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Credit Sales Management</CardTitle>
              <CardDescription>
                View all credit sales, track due payments, and manage collections.
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

      {/* We're reusing the dialogs from the parent component, so they don't need to be included here */}
    </div>
  );
};

export default CreditSales;
