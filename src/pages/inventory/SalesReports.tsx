
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, FileText, Banknote, PieChart, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Import existing components
import { SalesHeader } from "@/components/inventory/sales/SalesHeader";
import { SalesFilters } from "@/components/inventory/sales/SalesFilters";
import { SalesTable, SalesItem } from "@/components/inventory/sales/SalesTable";
import { SaleDetailsDialog } from "@/components/inventory/sales/SaleDetailsDialog";
import { RecordPaymentDialog } from "@/components/inventory/sales/RecordPaymentDialog";
import { useSalesManagement } from "@/components/inventory/sales/hooks/useSalesManagement";
import { formatCurrency } from "@/utils/finance/financeUtils";

// Payment methods for the payment dialog
const paymentMethods = [
  { value: "Cash", label: "Cash", icon: Banknote },
  { value: "Credit Card", label: "Credit Card", icon: FileText }
];

const SalesReports = () => {
  // Use the custom hook to get all sales data
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
  } = useSalesManagement();

  // State for dialog visibility
  const [isSaleDetailsDialogOpen, setIsSaleDetailsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SalesItem | null>(null);

  // State for chart data
  const [salesByStatusData, setSalesByStatusData] = useState<any>(null);
  const [paymentStatusData, setPaymentStatusData] = useState<any>(null);
  const [monthlySalesData, setMonthlySalesData] = useState<any>(null);

  // Prepare chart data whenever filtered data changes
  useEffect(() => {
    if (filteredSalesData.length > 0) {
      prepareChartData();
    }
  }, [filteredSalesData]);

  // Prepare chart data from sales
  const prepareChartData = () => {
    // Sales by status chart
    const statusCounts = filteredSalesData.reduce((acc: Record<string, number>, sale) => {
      acc[sale.status] = (acc[sale.status] || 0) + 1;
      return acc;
    }, {});

    setSalesByStatusData({
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: 'Sales by Status',
          data: Object.values(statusCounts),
          backgroundColor: [
            'rgba(53, 162, 235, 0.5)',
            'rgba(255, 159, 64, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 99, 132, 0.5)',
          ],
          borderColor: [
            'rgba(53, 162, 235, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });

    // Payment status chart
    const paymentCounts = filteredSalesData.reduce((acc: Record<string, number>, sale) => {
      acc[sale.paymentStatus] = (acc[sale.paymentStatus] || 0) + 1;
      return acc;
    }, {});

    setPaymentStatusData({
      labels: Object.keys(paymentCounts),
      datasets: [
        {
          label: 'Payment Status',
          data: Object.values(paymentCounts),
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 159, 64, 0.5)',
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });

    // Monthly sales chart (last 6 months)
    const monthlyData: Record<string, number> = {};
    const now = new Date();
    
    // Initialize with last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyData[monthKey] = 0;
    }
    
    // Sum sales by month
    filteredSalesData.forEach(sale => {
      const saleDate = new Date(sale.date);
      const monthKey = saleDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey] += sale.total;
      }
    });
    
    setMonthlySalesData({
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: 'Monthly Sales',
          data: Object.values(monthlyData),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgba(53, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

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
        title="Sales Reports"
      />

      {/* Sales Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
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
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalSales > 0 ? ((totalPaid / totalSales) * 100).toFixed(1) : 0}% of total sales
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalSales > 0 ? ((totalOutstanding / totalSales) * 100).toFixed(1) : 0}% of total sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {!loading && filteredSalesData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlySalesData && <Bar 
                data={monthlySalesData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: false,
                    },
                  },
                }} 
              />}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sales by Status</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {salesByStatusData && <Pie 
                data={salesByStatusData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    }
                  }
                }} 
              />}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {paymentStatusData && <Pie 
                data={paymentStatusData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    }
                  }
                }} 
              />}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content */}
      <Tabs defaultValue="sales-report" className="w-full">
        <TabsList>
          <TabsTrigger value="sales-report" className="gap-2">
            <BarChart size={16} />
            Sales Report
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp size={16} />
            Sales Trends
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
                loading={loading}
                onGenerateBill={generateBill}
                onPrintInvoice={handlePrintInvoice}
                onViewDetails={handleViewDetails}
                onRecordPayment={handleOpenPaymentDialog}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Trends Analysis</CardTitle>
              <CardDescription>
                View sales trends and analytics over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <p>Loading sales data...</p>
                </div>
              ) : filteredSalesData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p>No sales data available to display trends.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Monthly Sales Performance</h3>
                    <div className="h-80">
                      {monthlySalesData && <Bar 
                        data={monthlySalesData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                            },
                            title: {
                              display: false,
                            },
                          },
                        }} 
                      />}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Sales by Status</h3>
                      <div className="h-80">
                        {salesByStatusData && <Pie 
                          data={salesByStatusData} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'right' as const,
                              }
                            }
                          }} 
                        />}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Payment Status Distribution</h3>
                      <div className="h-80">
                        {paymentStatusData && <Pie 
                          data={paymentStatusData} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'right' as const,
                              }
                            }
                          }} 
                        />}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
