
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

// Import new components
import { SalesHeader } from "@/components/inventory/sales/SalesHeader";
import { SalesFilters } from "@/components/inventory/sales/SalesFilters";
import { SalesTable, SalesItem } from "@/components/inventory/sales/SalesTable";
import { NewSaleDialog } from "@/components/inventory/sales/NewSaleDialog";
import { SaleDetailsDialog } from "@/components/inventory/sales/SaleDetailsDialog";
import { RecordPaymentDialog } from "@/components/inventory/sales/RecordPaymentDialog";
import { useSalesManagement } from "@/components/inventory/sales/hooks/useSalesManagement";

// Import mock data
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

const productCategories = [
  "Toner",
  "Drum",
  "Spare Parts",
  "Copier Machine",
  "Printer",
  "Finishing Machine"
];

const paymentMethods = [
  { value: "cash", label: "Cash", icon: Wallet },
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  { value: "upi", label: "UPI", icon: IndianRupee },
  { value: "credit", label: "Credit (Due Payment)", icon: Calendar },
];

const customerTypes = [
  { value: "customer", label: "Regular Customer" },
  { value: "dealer", label: "Dealer" },
  { value: "government", label: "Government" },
];

import { 
  CreditCard, 
  Calendar, 
  IndianRupee, 
  Wallet, 
  Building2 
} from "lucide-react";

const InventorySales = () => {
  // Use the custom hook to manage sales state and operations
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
    addSale,
    generateBill,
    recordPayment,
    exportSalesData,
  } = useSalesManagement(salesData);

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
    toast.success(`Printing invoice #${sale.invoiceNumber} for ${sale.customer}`);
  };

  // Handle opening payment dialog
  const handleOpenPaymentDialog = (sale: SalesItem) => {
    setSelectedSale(sale);
    setIsPaymentDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
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
