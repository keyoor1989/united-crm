import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VendorPerformanceMetrics from "@/components/inventory/vendors/VendorPerformanceMetrics";
import { Vendor, VendorPerformanceMetric } from "@/types/inventory";

// Mock vendors data
const mockVendors: Vendor[] = [
  {
    id: "vendor1",
    name: "Ajanta Traders",
    contactPerson: "Rajesh Kumar",
    gstNo: "24AAKCS9636Q1ZX",
    phone: "9876543210",
    email: "info@ajanta.com",
    address: "142, Industrial Area, Indore, MP",
    createdAt: "2024-01-15"
  },
  {
    id: "vendor2",
    name: "Ravi Distributors",
    contactPerson: "Sunil Ravi",
    gstNo: "08AAQCS5896P1Z0",
    phone: "8765432109",
    email: "sales@ravidistributors.com",
    address: "278, MIDC Area, Nagpur, MH",
    createdAt: "2024-01-20"
  },
  {
    id: "vendor3",
    name: "Mehta Enterprises",
    contactPerson: "Amit Mehta",
    gstNo: "33AAICS4599Q2ZX",
    phone: "7654321098",
    email: "contact@mehtaenterprises.com",
    address: "56, Electronic City, Bangalore, KA",
    createdAt: "2024-02-05"
  }
];

// Mock performance metrics data
const mockPerformanceData: VendorPerformanceMetric[] = [
  // Ajanta Traders
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
  },
  
  // Ravi Distributors
  {
    id: "perf004",
    vendorId: "vendor2",
    period: "Q1 2025",
    totalOrders: 35,
    onTimeDelivery: 30,
    avgDeliveryTime: 3.5,
    priceConsistency: 4.2,
    productQuality: 4.3,
    returnRate: 2.8,
    reliabilityScore: 85,
    createdAt: "2025-04-01"
  },
  {
    id: "perf005",
    vendorId: "vendor2",
    period: "Q4 2024",
    totalOrders: 32,
    onTimeDelivery: 25,
    avgDeliveryTime: 3.8,
    priceConsistency: 4.0,
    productQuality: 4.1,
    returnRate: 3.2,
    reliabilityScore: 82,
    createdAt: "2025-01-01"
  },
  {
    id: "perf006",
    vendorId: "vendor2",
    period: "Q3 2024",
    totalOrders: 28,
    onTimeDelivery: 22,
    avgDeliveryTime: 4.0,
    priceConsistency: 3.8,
    productQuality: 4.0,
    returnRate: 3.5,
    reliabilityScore: 78,
    createdAt: "2024-10-01"
  },
  
  // Mehta Enterprises
  {
    id: "perf007",
    vendorId: "vendor3",
    period: "Q1 2025",
    totalOrders: 28,
    onTimeDelivery: 26,
    avgDeliveryTime: 2.1,
    priceConsistency: 3.8,
    productQuality: 4.5,
    returnRate: 1.5,
    reliabilityScore: 88,
    createdAt: "2025-04-01"
  },
  {
    id: "perf008",
    vendorId: "vendor3",
    period: "Q4 2024",
    totalOrders: 25,
    onTimeDelivery: 23,
    avgDeliveryTime: 2.3,
    priceConsistency: 3.6,
    productQuality: 4.3,
    returnRate: 1.7,
    reliabilityScore: 86,
    createdAt: "2025-01-01"
  },
  {
    id: "perf009",
    vendorId: "vendor3",
    period: "Q3 2024",
    totalOrders: 22,
    onTimeDelivery: 19,
    avgDeliveryTime: 2.5,
    priceConsistency: 3.5,
    productQuality: 4.2,
    returnRate: 2.0,
    reliabilityScore: 82,
    createdAt: "2024-10-01"
  }
];

const timePeriods = ["Q1 2025", "Q4 2024", "Q3 2024"];

const VendorPerformanceDemo = () => {
  const [selectedVendor, setSelectedVendor] = useState<Vendor>(mockVendors[0]);

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vendor Performance Metrics</h1>
          <p className="text-muted-foreground">
            Track and analyze vendor performance over time
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Vendor</CardTitle>
          <CardDescription>
            Choose a vendor to view their performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedVendor.id} 
            onValueChange={(value) => {
              const vendor = mockVendors.find(v => v.id === value);
              if (vendor) setSelectedVendor(vendor);
            }}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a vendor" />
            </SelectTrigger>
            <SelectContent>
              {mockVendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <VendorPerformanceMetrics 
        vendor={selectedVendor}
        performanceData={mockPerformanceData}
        timePeriods={timePeriods}
      />
    </div>
  );
};

export default VendorPerformanceDemo;
