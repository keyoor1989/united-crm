
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Award,
  Search,
  Filter,
  Store,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Clock,
  ShieldCheck,
  Truck,
  Percent,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock vendor performance data
const mockVendorPerformance = [
  {
    id: "vp001",
    vendorId: "vendor1",
    vendorName: "Ajanta Traders",
    totalOrders: 42,
    onTimeDelivery: 38,
    avgDeliveryTime: 2.3, // days
    priceConsistency: 4.5, // score out of 5
    productQuality: 4.7, // score out of 5
    returnRate: 1.2, // percentage
    reliabilityScore: 92, // calculated score
    period: "Q1 2025",
  },
  {
    id: "vp002",
    vendorId: "vendor2",
    vendorName: "Ravi Distributors",
    totalOrders: 35,
    onTimeDelivery: 30,
    avgDeliveryTime: 3.5,
    priceConsistency: 4.2,
    productQuality: 4.3,
    returnRate: 2.8,
    reliabilityScore: 85,
    period: "Q1 2025",
  },
  {
    id: "vp003",
    vendorId: "vendor3",
    vendorName: "Mehta Enterprises",
    totalOrders: 28,
    onTimeDelivery: 26,
    avgDeliveryTime: 2.1,
    priceConsistency: 3.8,
    productQuality: 4.5,
    returnRate: 1.5,
    reliabilityScore: 88,
    period: "Q1 2025",
  },
  {
    id: "vp004",
    vendorId: "vendor4",
    vendorName: "Global Supplies",
    totalOrders: 15,
    onTimeDelivery: 12,
    avgDeliveryTime: 4.2,
    priceConsistency: 4.0,
    productQuality: 4.1,
    returnRate: 3.0,
    reliabilityScore: 80,
    period: "Q1 2025",
  },
  {
    id: "vp005",
    vendorId: "vendor5",
    vendorName: "Tech Parts Ltd",
    totalOrders: 22,
    onTimeDelivery: 20,
    avgDeliveryTime: 1.8,
    priceConsistency: 4.7,
    productQuality: 4.8,
    returnRate: 0.9,
    reliabilityScore: 94,
    period: "Q1 2025",
  },
];

// Radar chart data for vendor comparison
const getRadarChartData = (selectedVendors) => {
  const metrics = [
    { name: 'Delivery Time', key: 'avgDeliveryTime', invert: true, max: 5 },
    { name: 'Price Consistency', key: 'priceConsistency', invert: false, max: 5 },
    { name: 'Product Quality', key: 'productQuality', invert: false, max: 5 },
    { name: 'Return Rate', key: 'returnRate', invert: true, max: 5 },
    { name: 'On-Time Delivery', key: 'onTimeDeliveryRate', invert: false, max: 100 },
  ];
  
  return metrics.map(metric => {
    const dataPoint = { name: metric.name };
    
    selectedVendors.forEach(vendorId => {
      const vendor = mockVendorPerformance.find(v => v.vendorId === vendorId);
      if (vendor) {
        let value;
        
        if (metric.key === 'onTimeDeliveryRate') {
          // Calculate on-time delivery rate as a percentage
          value = (vendor.onTimeDelivery / vendor.totalOrders) * 100;
        } else {
          value = vendor[metric.key];
        }
        
        // Invert values where lower is better (e.g., delivery time, return rate)
        if (metric.invert) {
          if (metric.key === 'returnRate') {
            // For return rate, transform to a 0-5 scale where 5 is best (0% returns)
            value = 5 - (value / 5);
          } else if (metric.key === 'avgDeliveryTime') {
            // For delivery time, transform to a 0-5 scale where 5 is best (0 days)
            value = 5 - Math.min(value, 5);
          }
        }
        
        dataPoint[vendor.vendorName] = value;
      }
    });
    
    return dataPoint;
  });
};

// Bar chart data for reliability scores
const getReliabilityChartData = (vendors) => {
  return vendors.map(vendor => ({
    name: vendor.vendorName,
    score: vendor.reliabilityScore,
  }));
};

const VendorPerformance = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendors, setSelectedVendors] = useState(["vendor1", "vendor2", "vendor3"]);
  const [timePeriod, setTimePeriod] = useState("Q1 2025");

  // Filter vendors by search query
  const filteredVendors = mockVendorPerformance.filter(vendor => 
    searchQuery ? 
      vendor.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
    : true
  );
  
  // Toggle vendor selection for charts
  const toggleVendorSelection = (vendorId) => {
    if (selectedVendors.includes(vendorId)) {
      // Remove vendor if already selected
      if (selectedVendors.length > 1) { // Ensure at least one vendor is selected
        setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
      }
    } else {
      // Add vendor if not already selected (limit to 5 vendors for readability)
      if (selectedVendors.length < 5) {
        setSelectedVendors([...selectedVendors, vendorId]);
      }
    }
  };
  
  // Get vendor rating badge variant
  const getVendorRatingBadge = (score) => {
    if (score >= 90) return "success";
    if (score >= 80) return "default";
    if (score >= 70) return "secondary";
    return "outline";
  };

  return (
    <Layout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Vendor Performance Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and evaluate your supplier performance
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="relative grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vendors..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1 2025">Q1 2025</SelectItem>
              <SelectItem value="Q4 2024">Q4 2024</SelectItem>
              <SelectItem value="Q3 2024">Q3 2024</SelectItem>
              <SelectItem value="2024">Year 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Top Performer</p>
                  <p className="text-xl font-bold">Tech Parts Ltd</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="success" className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      94% Reliability
                    </Badge>
                  </div>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fastest Delivery</p>
                  <p className="text-xl font-bold">Tech Parts Ltd</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="default" className="flex items-center gap-1">
                      <Truck className="h-3 w-3 mr-1" />
                      1.8 days avg.
                    </Badge>
                  </div>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Lowest Return Rate</p>
                  <p className="text-xl font-bold">Tech Parts Ltd</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="success" className="flex items-center gap-1">
                      <Percent className="h-3 w-3 mr-1" />
                      0.9% returns
                    </Badge>
                  </div>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <RotateCcw className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Performance Overview</TabsTrigger>
            <TabsTrigger value="comparison">Vendor Comparison</TabsTrigger>
            <TabsTrigger value="reliability">Reliability Scores</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Performance Overview</CardTitle>
                <CardDescription>
                  Key metrics for all vendors during {timePeriod}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Total Orders</TableHead>
                      <TableHead>On-Time Delivery</TableHead>
                      <TableHead>Avg. Delivery Time</TableHead>
                      <TableHead>Return Rate</TableHead>
                      <TableHead>Product Quality</TableHead>
                      <TableHead>Price Consistency</TableHead>
                      <TableHead>Reliability Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-muted-foreground" />
                            {vendor.vendorName}
                          </div>
                        </TableCell>
                        <TableCell>{vendor.totalOrders}</TableCell>
                        <TableCell>
                          {vendor.onTimeDelivery} ({Math.round((vendor.onTimeDelivery / vendor.totalOrders) * 100)}%)
                        </TableCell>
                        <TableCell>{vendor.avgDeliveryTime} days</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {vendor.returnRate}%
                            {vendor.returnRate < 2 ? (
                              <TrendingDown className="h-4 w-4 text-green-500 ml-1" />
                            ) : (
                              <TrendingUp className="h-4 w-4 text-red-500 ml-1" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {vendor.productQuality} / 5
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {vendor.priceConsistency} / 5
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getVendorRatingBadge(vendor.reliabilityScore)}>
                            {vendor.reliabilityScore}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredVendors.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No vendors found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p><strong>Reliability Score:</strong> Calculated based on delivery time, product quality, return rate, and price consistency.</p>
                  <p><strong>Price Consistency:</strong> Measures how stable a vendor's pricing is over time.</p>
                  <p><strong>Product Quality:</strong> Based on inspection results and return rates.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="comparison" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Performance Comparison</CardTitle>
                <CardDescription>
                  Compare key metrics across vendors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Select vendors to compare:</p>
                  <div className="flex flex-wrap gap-2">
                    {mockVendorPerformance.map((vendor) => (
                      <Badge 
                        key={vendor.vendorId}
                        variant={selectedVendors.includes(vendor.vendorId) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleVendorSelection(vendor.vendorId)}
                      >
                        {vendor.vendorName}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="h-96 mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius="80%" data={getRadarChartData(selectedVendors)}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis domain={[0, 5]} />
                      
                      {selectedVendors.map((vendorId, index) => {
                        const vendor = mockVendorPerformance.find(v => v.vendorId === vendorId);
                        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE'];
                        
                        if (vendor) {
                          return (
                            <Radar 
                              key={vendor.vendorId}
                              name={vendor.vendorName}
                              dataKey={vendor.vendorName}
                              stroke={colors[index % colors.length]}
                              fill={colors[index % colors.length]}
                              fillOpacity={0.2}
                            />
                          );
                        }
                        return null;
                      })}
                      
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="font-medium">How to read this chart:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Each axis represents a performance metric</li>
                    <li>Higher values (further from center) indicate better performance</li>
                    <li>For metrics like delivery time and return rate, values are inverted so higher is better</li>
                    <li>A perfect vendor would create a complete pentagon at the outer edge</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reliability" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Reliability Scores</CardTitle>
                <CardDescription>
                  Overall reliability ranking of vendors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getReliabilityChartData(filteredVendors)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" name="Reliability Score (%)" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Reliability Score Calculation</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our vendor reliability score is a weighted composite of multiple performance factors:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-md border p-4 bg-card">
                      <h4 className="font-medium mb-2">Weighted Factors</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span>On-Time Delivery Rate:</span>
                          <span className="font-medium">35%</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Product Quality:</span>
                          <span className="font-medium">30%</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Return Rate (inverse):</span>
                          <span className="font-medium">20%</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Price Consistency:</span>
                          <span className="font-medium">15%</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="rounded-md border p-4 bg-card">
                      <h4 className="font-medium mb-2">Reliability Tiers</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span>Exceptional (90-100%):</span>
                          <Badge variant="success">Preferred Vendor</Badge>
                        </li>
                        <li className="flex justify-between">
                          <span>Strong (80-89%):</span>
                          <Badge>Approved Vendor</Badge>
                        </li>
                        <li className="flex justify-between">
                          <span>Average (70-79%):</span>
                          <Badge variant="secondary">Qualified Vendor</Badge>
                        </li>
                        <li className="flex justify-between">
                          <span>Below Average (&lt; 70%):</span>
                          <Badge variant="outline">Review Required</Badge>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default VendorPerformance;
