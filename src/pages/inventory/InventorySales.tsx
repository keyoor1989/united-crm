
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

// Import components
import { SalesHeader } from "@/components/inventory/sales/SalesHeader";
import { SalesFilters } from "@/components/inventory/sales/SalesFilters";
import { SalesTable, SalesItem } from "@/components/inventory/sales/SalesTable";
import { NewSaleDialog } from "@/components/inventory/sales/NewSaleDialog";
import { SaleDetailsDialog } from "@/components/inventory/sales/SaleDetailsDialog";
import { RecordPaymentDialog } from "@/components/inventory/sales/RecordPaymentDialog";
import { useSalesManagement } from "@/components/inventory/sales/hooks/useSalesManagement";

// Payment method data
import { 
  CreditCard, 
  Calendar, 
  IndianRupee, 
  Wallet, 
  Building2, 
  CheckSquare,
  BanknoteIcon
} from "lucide-react";

const paymentMethods = [
  { value: "Cash", label: "Cash", icon: Wallet },
  { value: "Credit Card", label: "Credit Card", icon: CreditCard },
  { value: "Bank Transfer", label: "Bank Transfer", icon: Building2 },
  { value: "UPI", label: "UPI", icon: IndianRupee },
  { value: "Credit", label: "Credit (Due Payment)", icon: Calendar },
  { value: "Cheque", label: "Cheque", icon: BanknoteIcon },
  { value: "Online", label: "Online Payment", icon: CheckSquare },
];

const customerTypes = [
  { value: "Customer", label: "Regular Customer" },
  { value: "Dealer", label: "Dealer" },
  { value: "Government", label: "Government" },
];

const productCategories = [
  "Toner",
  "Drum",
  "Spare Parts",
  "Copier Machine",
  "Printer",
  "Finishing Machine"
];

const InventorySales = () => {
  // Use the custom hook to manage sales state and operations
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
    addSale,
    generateBill,
    recordPayment,
    exportSalesData,
  } = useSalesManagement();

  // State for dialog visibility
  const [isNewSaleDialogOpen, setIsNewSaleDialogOpen] = useState(false);
  const [isSaleDetailsDialogOpen, setIsSaleDetailsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SalesItem | null>(null);

  // Handle view details
  const handleViewDetails = (sale: SalesItem) => {
    setSelectedSale(sale);
    setIsSaleDetailsDialogOpen(true);
  };

  // Handle generating bill
  const handleGenerateBill = (sale: SalesItem) => {
    generateBill(sale);
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

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Sales Management | Inventory</title>
      </Helmet>
      
      {/* Header with title and action buttons */}
      <SalesHeader 
        onNewSale={() => setIsNewSaleDialogOpen(true)} 
        onExportData={exportSalesData} 
      />

      {/* Main content */}
      <Tabs defaultValue="sales" className="w-full">
        <TabsList>
          <TabsTrigger value="sales" className="gap-2">
            <ShoppingBag size={16} />
            Sales
          </TabsTrigger>
          {/* Additional tabs can be added here */}
        </TabsList>

        <TabsContent value="sales" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Management</CardTitle>
              <CardDescription>
                View all sales, filter by status, and manage invoices.
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
                onGenerateBill={handleGenerateBill}
                onPrintInvoice={handlePrintInvoice}
                onViewDetails={handleViewDetails}
                onRecordPayment={handleOpenPaymentDialog}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <NewSaleDialog 
        open={isNewSaleDialogOpen}
        onClose={() => setIsNewSaleDialogOpen(false)}
        productCategories={productCategories}
        customerTypes={customerTypes}
        paymentMethods={paymentMethods}
        onSaveSale={addSale}
      />
      
      <SaleDetailsDialog 
        open={isSaleDetailsDialogOpen}
        onClose={() => setIsSaleDetailsDialogOpen(false)}
        sale={selectedSale}
        onGenerateBill={handleGenerateBill}
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

export default InventorySales;
