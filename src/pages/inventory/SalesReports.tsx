
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  CreditCard,
  Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/utils/finance/financeUtils";

// Mock data for reports
const monthlySalesData = [
  { month: '2025-01', cashSales: 352000, creditSales: 148000, totalSales: 500000 },
  { month: '2025-02', cashSales: 410000, creditSales: 175000, totalSales: 585000 },
  { month: '2025-03', cashSales: 380000, creditSales: 220000, totalSales: 600000 },
  { month: '2025-04', cashSales: 290000, creditSales: 160000, totalSales: 450000 },
];

const topSellingProducts = [
  { id: 'P001', name: 'Kyocera TK-1175 Toner', category: 'Toner', quantitySold: 85, revenue: 297500 },
  { id: 'P002', name: 'Canon NPG-59 Drum', category: 'Drum', quantitySold: 42, revenue: 176400 },
  { id: 'P003', name: 'HP CF217A Toner', category: 'Toner', quantitySold: 78, revenue: 140400 },
  { id: 'P004', name: 'Ricoh SP 210 Toner', category: 'Toner', quantitySold: 56, revenue: 134400 },
  { id: 'P005', name: 'Xerox 3020 Drum Unit', category: 'Drum', quantitySold: 34, revenue: 119000 },
];

const customerBreakdown = [
  { customerType: 'Regular Customers', salesCount: 245, salesAmount: 980000, percentage: 45 },
  { customerType: 'Dealers', salesCount: 128, salesAmount: 768000, percentage: 35 },
  { customerType: 'Government', salesCount: 86, salesAmount: 440000, percentage: 20 },
];

const RecentSaleRow = ({ 
  date, 
  invoiceNo, 
  customer, 
  type, 
  amount, 
  status 
}: { 
  date: string; 
  invoiceNo: string; 
  customer: string; 
  type: string; 
  amount: number; 
  status: string; 
}) => (
  <TableRow>
    <TableCell>{format(new Date(date), "dd/MM/yyyy")}</TableCell>
    <TableCell>{invoiceNo}</TableCell>
    <TableCell>{customer}</TableCell>
    <TableCell>
      {type === "Cash" ? (
        <div className="flex items-center">
          <Banknote className="mr-2 h-4 w-4 text-green-500" />
          <span>Cash</span>
        </div>
      ) : (
        <div className="flex items-center">
          <CreditCard className="mr-2 h-4 w-4 text-blue-500" />
          <span>Credit</span>
        </div>
      )}
    </TableCell>
    <TableCell>{formatCurrency(amount)}</TableCell>
    <TableCell>
      <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block
        ${status === "Paid" ? "bg-green-100 text-green-800" : 
          status === "Due" ? "bg-red-100 text-red-800" : 
          "bg-yellow-100 text-yellow-800"}`}>
        {status}
      </div>
    </TableCell>
  </TableRow>
);

const recentSalesData = [
  { date: '2025-04-15', invoiceNo: 'INV-2025-042', customer: 'ABC Corporation', type: 'Cash', amount: 17500, status: 'Paid' },
  { date: '2025-04-14', invoiceNo: 'INV-2025-041', customer: 'Tech Solutions', type: 'Credit', amount: 22000, status: 'Due' },
  { date: '2025-04-12', invoiceNo: 'INV-2025-039', customer: 'XYZ Ltd', type: 'Cash', amount: 8400, status: 'Paid' },
  { date: '2025-04-10', invoiceNo: 'INV-2025-037', customer: 'Global Enterprises', type: 'Credit', amount: 10500, status: 'Due' },
  { date: '2025-04-08', invoiceNo: 'INV-2025-035', customer: 'City Hospital', type: 'Cash', amount: 18000, status: 'Paid' },
];

const SalesReports = () => {
  const [dateRange, setDateRange] = useState("month");
  const navigate = useNavigate();
  
  // Calculate summary statistics
  const currentMonthData = monthlySalesData[monthlySalesData.length - 1];
  const previousMonthData = monthlySalesData[monthlySalesData.length - 2];
  
  const totalSalesGrowth = ((currentMonthData.totalSales - previousMonthData.totalSales) / previousMonthData.totalSales) * 100;
  const creditSalesPercentage = (currentMonthData.creditSales / currentMonthData.totalSales) * 100;
  
  const handleExportData = () => {
    // In a real implementation, this would export the data to CSV or Excel
    console.log("Exporting report data...");
  };

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Sales Reports | Inventory Management</title>
      </Helmet>

      {/* Header with title and action buttons */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales Reports</h2>
          <p className="text-muted-foreground">
            View sales performance metrics, trends, and insights.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData} className="gap-2">
            <Download size={16} />
            Export Data
          </Button>
        </div>
      </div>

      {/* Date range filter */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={dateRange === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange("week")}
        >
          This Week
        </Button>
        <Button 
          variant={dateRange === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange("month")}
        >
          This Month
        </Button>
        <Button 
          variant={dateRange === "quarter" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange("quarter")}
        >
          This Quarter
        </Button>
        <Button 
          variant={dateRange === "year" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange("year")}
        >
          This Year
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonthData.totalSales)}</div>
            <div className="flex items-center mt-1">
              <span className={`text-xs ${totalSalesGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
                {totalSalesGrowth >= 0 ? "↑" : "↓"} {Math.abs(totalSalesGrowth).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cash Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonthData.cashSales)}</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-muted-foreground">
                {((currentMonthData.cashSales / currentMonthData.totalSales) * 100).toFixed(1)}% of total sales
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Credit Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonthData.creditSales)}</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-muted-foreground">
                {creditSalesPercentage.toFixed(1)}% of total sales
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <FileText size={16} />
            Product Performance
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <FileText size={16} />
            Customer Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Breakdown</CardTitle>
              <CardDescription>
                Comparison of cash vs credit sales by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Cash Sales</TableHead>
                    <TableHead className="text-right">Credit Sales</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlySalesData.map((month) => (
                    <TableRow key={month.month}>
                      <TableCell>{format(new Date(month.month + "-01"), "MMMM yyyy")}</TableCell>
                      <TableCell className="text-right">{formatCurrency(month.cashSales)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(month.creditSales)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(month.totalSales)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>
                Latest transactions for the current period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSalesData.map((sale, index) => (
                    <RecentSaleRow
                      key={index}
                      date={sale.date}
                      invoiceNo={sale.invoiceNo}
                      customer={sale.customer}
                      type={sale.type}
                      amount={sale.amount}
                      status={sale.status}
                    />
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/inventory/sales")}
                >
                  View All Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>
                Products with highest sales volume and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Quantity Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSellingProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">{product.quantitySold}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Type Analysis</CardTitle>
              <CardDescription>
                Sales breakdown by customer segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Type</TableHead>
                    <TableHead className="text-right">Number of Sales</TableHead>
                    <TableHead className="text-right">Sales Amount</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerBreakdown.map((segment) => (
                    <TableRow key={segment.customerType}>
                      <TableCell>{segment.customerType}</TableCell>
                      <TableCell className="text-right">{segment.salesCount}</TableCell>
                      <TableCell className="text-right">{formatCurrency(segment.salesAmount)}</TableCell>
                      <TableCell className="text-right">{segment.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesReports;
