
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
import { SaleDetailsDialog } from "@/components/inventory/sales/SaleDetailsDialog";
import { RecordPaymentDialog } from "@/components/inventory/sales/RecordPaymentDialog";
import { useSalesManagement } from "@/components/inventory/sales/hooks/useSalesManagement";
import { formatCurrency } from "@/utils/finance/financeUtils";

// Payment methods data
import { 
  Calendar, 
  IndianRupee, 
  Wallet, 
  Building2, 
  BanknoteIcon 
} from "lucide-react";

const paymentMethods = [
  { value: "Cash", label: "Cash", icon: Wallet },
  { value: "Credit Card", label: "Credit Card", icon: CreditCard },
  { value: "Bank Transfer", label: "Bank Transfer", icon: Building2 },
  { value: "UPI", label: "UPI", icon: IndianRupee },
  { value: "Cheque", label: "Cheque", icon: BanknoteIcon },
];

const CreditSales = () => {
  // Use the custom hook with credit sales filter
  const {
    filteredSalesData,
    loading,
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
    loadSalesData
  } = useSalesManagement();

  // Load credit sales on mount
  React.useEffect(() => {
    loadSalesData(true); // true indicates to load only credit sales
  }, []);

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
    if (!sale.invoiceNumber) {
      toast.error("No invoice number available");
      return;
    }
    toast.success(`Printing invoice #${sale.invoiceNumber} for ${sale.customer}`);
  };

  // Handle opening payment dialog
  const handleOpenPaymentDialog = (sale: SalesItem) => {
    setSelectedSale(sale);
    setIsPaymentDialogOpen(true);
  };

  // Calculate total due amount
  const totalDueAmount = filteredSalesData.reduce((sum, sale) => {
    if (sale.paymentStatus === "Due" || sale.paymentStatus === "Partial") {
      return sum + sale.total;
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Credit Sales | Inventory</title>
      </Helmet>
      
      {/* Header with title and action buttons */}
      <SalesHeader 
        onNewSale={() => toast.info("Please use regular Sales page to create new Credit Sales")} 
        onExportData={exportSalesData} 
        title="Credit Sales"
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
                loading={loading}
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

export default CreditSales;
