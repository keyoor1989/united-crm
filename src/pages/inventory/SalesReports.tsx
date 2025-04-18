import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, PieChart, Calendar, ArrowUpDown } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";

// Import custom components
import { SalesReportHeader } from "@/components/inventory/sales/SalesReportHeader";
import { SalesPerformanceChart } from "@/components/inventory/sales/charts/SalesPerformanceChart";
import { PaymentMethodChart } from "@/components/inventory/sales/charts/PaymentMethodChart";
import { CustomerTypeChart } from "@/components/inventory/sales/charts/CustomerTypeChart";
import { fetchSalesReportData } from "@/services/salesService";
import { SalesItem } from "@/components/inventory/sales/SalesTable";
import { Skeleton } from "@/components/ui/skeleton";

const SalesReports = () => {
  // State for date range
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(new Date())
  });
  
  // State for sales data
  const [salesData, setSalesData] = useState<SalesItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch sales data based on date range
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Use the fetchSalesReportData function
        const data = await fetchSalesReportData(
          dateRange.from as Date, 
          dateRange.to as Date
        );
        setSalesData(data);
      } catch (error) {
        console.error("Error loading sales report data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (dateRange.from && dateRange.to) {
      loadData();
    }
  }, [dateRange]);
  
  // Handle date range changes
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };
  
  // Calculated metrics
  const totalSales = salesData.length;
  const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0);
  const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  const creditSalesCount = salesData.filter(sale => sale.status.toLowerCase().includes("credit")).length;
  const creditSalesPercentage = totalSales > 0 ? (creditSalesCount / totalSales) * 100 : 0;
  
  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Sales Reports | Inventory</title>
      </Helmet>
      
      {/* Header with title and date range picker */}
      <SalesReportHeader
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />
      
      {/* Sales metrics cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{totalSales}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {dateRange.from && dateRange.to ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}` : "Select date range"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {creditSalesCount} credit sales ({creditSalesPercentage.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Sale Value</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">₹{averageSaleValue.toFixed(2)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Per transaction
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Credit Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{creditSalesCount}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {creditSalesPercentage.toFixed(1)}% of total sales
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="sales-performance" className="w-full">
        <TabsList>
          <TabsTrigger value="sales-performance" className="gap-2">
            <BarChart3 size={16} />
            Sales Performance
          </TabsTrigger>
          <TabsTrigger value="payment-methods" className="gap-2">
            <PieChart size={16} />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="customer-types" className="gap-2">
            <ArrowUpDown size={16} />
            Customer Types
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales-performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>
                Sales volume and revenue over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <SalesPerformanceChart salesData={salesData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment-methods" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Distribution</CardTitle>
              <CardDescription>
                Breakdown of sales by payment method
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <PaymentMethodChart salesData={salesData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customer-types" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Types Analysis</CardTitle>
              <CardDescription>
                Distribution of sales by customer type
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <CustomerTypeChart salesData={salesData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesReports;
