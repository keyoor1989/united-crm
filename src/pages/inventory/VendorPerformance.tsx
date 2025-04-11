import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import VendorPerformanceMetrics from "@/components/inventory/vendors/VendorPerformanceMetrics";
import { Vendor, VendorPerformanceMetric } from "@/types/inventory";

const VendorPerformance = () => {
  // Mock vendor data for demonstration
  const mockVendor: Vendor = {
    id: "vendor1",
    name: "Ajanta Traders",
    gstNo: "24AAKCS9636Q1ZX",
    phone: "9876543210",
    email: "info@ajanta.com",
    address: "142, Industrial Area, Indore, MP",
    createdAt: "2024-01-15"
  };

  // Mock performance data
  const mockPerformanceData: VendorPerformanceMetric[] = [
    {
      id: "perf001",
      vendorId: "vendor1",
      period: "Q1 2025",
      totalOrders: 42,
      onTimeDelivery: 38,
      avgDeliveryTime: 2.3,
      priceConsistency: 4.5,
      productQuality: 4.7,
      returnRate: 1.2,
      reliabilityScore: 92,
      createdAt: "2025-04-01"
    },
    {
      id: "perf002",
      vendorId: "vendor1",
      period: "Q4 2024",
      totalOrders: 38,
      onTimeDelivery: 34,
      avgDeliveryTime: 2.5,
      priceConsistency: 4.3,
      productQuality: 4.5,
      returnRate: 1.5,
      reliabilityScore: 89,
      createdAt: "2025-01-01"
    },
    {
      id: "perf003",
      vendorId: "vendor1",
      period: "Q3 2024",
      totalOrders: 35,
      onTimeDelivery: 30,
      avgDeliveryTime: 2.8,
      priceConsistency: 4.2,
      productQuality: 4.4,
      returnRate: 1.8,
      reliabilityScore: 86,
      createdAt: "2024-10-01"
    }
  ];

  // Time periods for the performance data
  const mockTimePeriods = ["Q1 2025", "Q4 2024", "Q3 2024"];

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vendor Performance</h1>
          <p className="text-muted-foreground">
            Monitor and analyze vendor performance metrics
          </p>
        </div>
        <Button className="flex items-center gap-1 bg-black text-white hover:bg-black/90">
          Generate Report
        </Button>
      </div>

      {/* Search and filter row */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            className="pl-8 w-full"
          />
        </div>
        
        <Button variant="outline" className="sm:ml-auto flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                Overall vendor performance metrics and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VendorPerformanceMetrics 
                vendor={mockVendor} 
                performanceData={mockPerformanceData} 
                timePeriods={mockTimePeriods} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs content */}
        <TabsContent value="quality" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
              <CardDescription>
                Product quality and defect rates by vendor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Quality metrics content would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Performance</CardTitle>
              <CardDescription>
                On-time delivery rates and fulfillment metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Delivery metrics content would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Analysis</CardTitle>
              <CardDescription>
                Cost trends and competitive pricing analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Pricing analysis content would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
              <CardDescription>
                Vendor responsiveness and communication effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Communication metrics content would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorPerformance;
