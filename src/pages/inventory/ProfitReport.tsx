
import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Filter, Calendar, TrendingUp, DollarSign, Percent, BarChart2 } from "lucide-react";

// Mock data for part profitability
const mockProfitData = [
  {
    name: 'TK-1175 Toner',
    purchaseRate: 3200,
    sellingRate: 4500,
    quantity: 28,
    profit: 1300,
    profitMargin: 29
  },
  {
    name: 'MP2014 Drum',
    purchaseRate: 2800,
    sellingRate: 4200,
    quantity: 15,
    profit: 1400,
    profitMargin: 33
  },
  {
    name: 'SP 210 Toner',
    purchaseRate: 2400,
    sellingRate: 3500,
    quantity: 35,
    profit: 1100,
    profitMargin: 31
  },
  {
    name: 'CF217A Toner',
    purchaseRate: 1800,
    sellingRate: 2800,
    quantity: 42,
    profit: 1000,
    profitMargin: 36
  },
  {
    name: '3020 Drum',
    purchaseRate: 3500,
    sellingRate: 5200,
    quantity: 12,
    profit: 1700,
    profitMargin: 33
  },
];

// Mock data for monthly profits
const mockMonthlyData = [
  { name: 'Jan', profit: 28000, sales: 65000, margin: 43 },
  { name: 'Feb', profit: 32000, sales: 72000, margin: 44 },
  { name: 'Mar', profit: 35000, sales: 78000, margin: 45 },
  { name: 'Apr', profit: 30000, sales: 68000, margin: 44 },
  { name: 'May', profit: 38000, sales: 82000, margin: 46 },
  { name: 'Jun', profit: 42000, sales: 90000, margin: 47 },
];

// Mock data for vendor comparison
const mockVendorData = [
  { name: 'Vendor A', avgPurchaseRate: 3200, quality: 4.5 },
  { name: 'Vendor B', avgPurchaseRate: 3050, quality: 4.2 },
  { name: 'Vendor C', avgPurchaseRate: 3300, quality: 4.7 },
  { name: 'Vendor D', avgPurchaseRate: 3150, quality: 4.0 },
];

const ProfitReport = () => {
  return (
    <Layout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Spare Part Profit Report</h1>
            <p className="text-muted-foreground">
              Track profitability of spare parts sales
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-1">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" className="gap-1">
              <Calendar className="h-4 w-4" />
              Change Period
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                  <p className="text-3xl font-bold">₹2,05,000</p>
                  <p className="text-xs text-green-500 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% from last quarter
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Margin</p>
                  <p className="text-3xl font-bold">34.2%</p>
                  <p className="text-xs text-green-500 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.5% from last quarter
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Percent className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Top Performer</p>
                  <p className="text-3xl font-bold">3020 Drum</p>
                  <p className="text-xs text-green-500 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    33% margin
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <BarChart2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Profit Trend</CardTitle>
                <CardDescription>
                  Six-month profit and sales trend
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={mockMonthlyData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="sales"
                        name="Total Sales (₹)"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="profit"
                        name="Profit (₹)"
                        stroke="#82ca9d"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="margin"
                        name="Margin (%)"
                        stroke="#ff7300"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Refine your profit report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateRange">Date Range</Label>
                    <Select defaultValue="quarter">
                      <SelectTrigger id="dateRange">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="quarter">Last Quarter</SelectItem>
                        <SelectItem value="sixMonths">Last 6 Months</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="itemType">Item Type</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="itemType">
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="toner">Toner</SelectItem>
                        <SelectItem value="drum">Drum</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="fuser">Fuser</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="brand">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem>
                        <SelectItem value="kyocera">Kyocera</SelectItem>
                        <SelectItem value="canon">Canon</SelectItem>
                        <SelectItem value="ricoh">Ricoh</SelectItem>
                        <SelectItem value="hp">HP</SelectItem>
                        <SelectItem value="xerox">Xerox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button className="w-full mt-2">
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Tabs defaultValue="parts">
          <TabsList>
            <TabsTrigger value="parts">Part Profitability</TabsTrigger>
            <TabsTrigger value="vendors">Vendor Comparison</TabsTrigger>
            <TabsTrigger value="topTen">Top 10 Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="parts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Part Profitability</CardTitle>
                <CardDescription>
                  Comparative analysis of spare part profitability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockProfitData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="purchaseRate" name="Purchase Rate (₹)" fill="#8884d8" />
                      <Bar dataKey="sellingRate" name="Selling Rate (₹)" fill="#82ca9d" />
                      <Bar dataKey="profit" name="Profit per Unit (₹)" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vendors" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Comparison</CardTitle>
                <CardDescription>
                  Compare pricing and quality across vendors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockVendorData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="avgPurchaseRate" name="Avg. Purchase Rate (₹)" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="quality" name="Quality Rating" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="topTen" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Profit-Making Parts</CardTitle>
                <CardDescription>
                  The most profitable spare parts by total profit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="border-b">
                      <tr className="border-b">
                        <th className="h-12 px-4 text-left align-middle font-medium">Part Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Qty Sold</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Avg. Purchase (₹)</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Avg. Selling (₹)</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Profit per Unit (₹)</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Total Profit (₹)</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Margin (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockProfitData.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-4 align-middle font-medium">{item.name}</td>
                          <td className="p-4 align-middle">{item.quantity}</td>
                          <td className="p-4 align-middle text-right">{item.purchaseRate.toLocaleString()}</td>
                          <td className="p-4 align-middle text-right">{item.sellingRate.toLocaleString()}</td>
                          <td className="p-4 align-middle text-right">{item.profit.toLocaleString()}</td>
                          <td className="p-4 align-middle text-right">{(item.profit * item.quantity).toLocaleString()}</td>
                          <td className="p-4 align-middle text-right">{item.profitMargin}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProfitReport;
