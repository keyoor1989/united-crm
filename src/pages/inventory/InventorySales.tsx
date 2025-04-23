
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Import components
import { SalesHeader } from "@/components/inventory/sales/SalesHeader";
import { SalesFilters } from "@/components/inventory/sales/SalesFilters";
import { SalesTable, SalesItem } from "@/components/inventory/sales/SalesTable";
import UnifiedSalesForm from "@/components/inventory/sales/UnifiedSalesForm";
import { SaleDetailsDialog } from "@/components/inventory/sales/SaleDetailsDialog";
import { RecordPaymentDialog } from "@/components/inventory/sales/RecordPaymentDialog";
import { ShipmentDetailsDialog } from "@/components/inventory/sales/ShipmentDetailsDialog";
import { useSalesManagement } from "@/components/inventory/sales/hooks/useSalesManagement";
import { CustomerTypeChart } from "@/components/inventory/sales/charts/CustomerTypeChart";
import { PaymentMethodChart } from "@/components/inventory/sales/charts/PaymentMethodChart";

// Payment method data
import { 
  Wallet, 
  Calendar, 
  Building2, 
  CheckSquare
} from "lucide-react";

const paymentMethods = [
  { value: "Cash", label: "Cash", icon: Wallet },
  { value: "Credit", label: "Credit (Due Payment)", icon: Calendar },
  { value: "CB Bank", label: "CB Bank", icon: Building2 },
  { value: "UC Bank", label: "UC Bank", icon: Building2 },
  { value: "UC Online", label: "UC Online", icon: CheckSquare },
  { value: "CB Online", label: "CB Online", icon: CheckSquare },
  { value: "Keyoor Bank", label: "Keyoor Bank", icon: Building2 },
  { value: "Nitesh Bank", label: "Nitesh Bank", icon: Building2 },
  { value: "Jyoti Bank", label: "Jyoti Bank", icon: Building2 },
  { value: "SY Bank", label: "SY Bank", icon: Building2 },
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
    salesData,
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
    updateShipmentDetails,
    exportSalesData,
    loadSalesData,
  } = useSalesManagement();

  // State for dialog visibility
  const [isNewSaleDialogOpen, setIsNewSaleDialogOpen] = useState(false);
  const [isSaleDetailsDialogOpen, setIsSaleDetailsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isShipmentDialogOpen, setIsShipmentDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SalesItem | null>(null);
  const [activeTab, setActiveTab] = useState("sales");
  
  const queryClient = useQueryClient();

  // Load sales data when component mounts
  useEffect(() => {
    // Only load data on initial mount
    const initialLoad = async () => {
      await loadSalesData();
    };
    
    initialLoad();
    // Don't include loadSalesData in dependencies to prevent infinite loops
  }, []);

  // Only reload data when activeTab changes to "analytics" and we don't have salesData yet
  useEffect(() => {
    if (activeTab === "analytics" && (!salesData || salesData.length === 0)) {
      loadSalesData();
    }
  }, [activeTab, salesData]);

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

  // Handle opening shipment dialog
  const handleOpenShipmentDialog = (sale: SalesItem) => {
    setSelectedSale(sale);
    setIsShipmentDialogOpen(true);
  };

  // Handle shipment updated
  const handleShipmentUpdated = () => {
    loadSalesData();
    toast.success("Shipment details updated successfully");
  };

  // Add a function to handle adding a new sale that also refreshes inventory
  const handleAddSale = async (sale: SalesItem) => {
    const saleId = await addSale(sale);
    
    // After sale is added, refresh inventory data
    if (saleId) {
      // Invalidate inventory queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.invalidateQueries({ queryKey: ['sales_inventory_items'] });
    }
    
    return saleId;
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
      <Tabs 
        defaultValue="sales" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="sales" className="gap-2">
            <ShoppingBag size={16} />
            Sales List
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 size={16} />
            Analytics
          </TabsTrigger>
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
                onUpdateShipment={handleOpenShipmentDialog}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Customer Type</CardTitle>
                <CardDescription>
                  Distribution of sales across different customer types
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <CustomerTypeChart salesData={salesData} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Distribution</CardTitle>
                <CardDescription>
                  Sales distribution by payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <PaymentMethodChart salesData={salesData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <UnifiedSalesForm 
        open={isNewSaleDialogOpen}
        onClose={() => setIsNewSaleDialogOpen(false)}
        productCategories={productCategories}
        customerTypes={customerTypes}
        paymentMethods={paymentMethods}
        onSaveSale={handleAddSale}
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

      <ShipmentDetailsDialog
        open={isShipmentDialogOpen}
        onClose={() => setIsShipmentDialogOpen(false)}
        sale={selectedSale}
        onShipmentUpdated={handleShipmentUpdated}
      />
    </div>
  );
};

export default InventorySales;
