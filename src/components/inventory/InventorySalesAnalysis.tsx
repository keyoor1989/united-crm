
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for sales analysis
const monthlySalesData = [
  { month: "Jan", dealer: 45000, customer: 30000, government: 15000 },
  { month: "Feb", dealer: 55000, customer: 35000, government: 25000 },
  { month: "Mar", dealer: 48000, customer: 38000, government: 18000 },
  { month: "Apr", dealer: 60000, customer: 42000, government: 30000 },
  { month: "May", dealer: 65000, customer: 40000, government: 22000 },
  { month: "Jun", dealer: 70000, customer: 45000, government: 35000 },
];

const productCategorySales = [
  { name: "Toner", value: 45 },
  { name: "Drum", value: 20 },
  { name: "Spare Parts", value: 15 },
  { name: "Copier Machine", value: 10 },
  { name: "Finishing Machine", value: 7 },
  { name: "Other", value: 3 },
];

const paymentMethodData = [
  { name: "Cash", value: 40 },
  { name: "Credit Card", value: 25 },
  { name: "Bank Transfer", value: 20 },
  { name: "UPI", value: 10 },
  { name: "Credit (Due)", value: 5 },
];

// Colors for pie charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

const InventorySalesAnalysis = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="monthly">
        <TabsList className="mb-4">
          <TabsTrigger value="monthly">Monthly Sales</TabsTrigger>
          <TabsTrigger value="category">Product Categories</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales by Customer Type</CardTitle>
              <CardDescription>
                Comparison of sales to dealers, regular customers, and government
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlySalesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, undefined]} />
                    <Legend />
                    <Bar dataKey="dealer" name="Dealer" fill="#0088FE" />
                    <Bar dataKey="customer" name="Customer" fill="#00C49F" />
                    <Bar dataKey="government" name="Government" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-md bg-blue-50 p-3">
                  <p className="text-sm font-medium text-blue-600">Dealer Sales</p>
                  <p className="text-2xl font-bold text-blue-800">
                    ₹{monthlySalesData.reduce((sum, item) => sum + item.dealer, 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-md bg-green-50 p-3">
                  <p className="text-sm font-medium text-green-600">Customer Sales</p>
                  <p className="text-2xl font-bold text-green-800">
                    ₹{monthlySalesData.reduce((sum, item) => sum + item.customer, 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-md bg-yellow-50 p-3">
                  <p className="text-sm font-medium text-yellow-600">Government Sales</p>
                  <p className="text-2xl font-bold text-yellow-800">
                    ₹{monthlySalesData.reduce((sum, item) => sum + item.government, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Product Category</CardTitle>
              <CardDescription>
                Distribution of sales across different product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productCategorySales}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productCategorySales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, undefined]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                {productCategorySales.slice(0, 3).map((category, index) => (
                  <div key={category.name} className="rounded-md bg-slate-50 p-3">
                    <p className="text-sm font-medium" style={{ color: COLORS[index] }}>
                      {category.name}
                    </p>
                    <p className="text-xl font-bold text-slate-800">
                      {category.value}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Payment Method</CardTitle>
              <CardDescription>
                Distribution of payment methods used for purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, undefined]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 flex flex-col space-y-2">
                <div className="flex items-center justify-between p-2 rounded-md bg-slate-50">
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS[0] }}></div>
                    <span>Cash</span>
                  </div>
                  <div className="font-semibold">₹320,000</div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-slate-50">
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS[1] }}></div>
                    <span>Credit Card</span>
                  </div>
                  <div className="font-semibold">₹200,000</div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-slate-50">
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS[2] }}></div>
                    <span>Bank Transfer</span>
                  </div>
                  <div className="font-semibold">₹160,000</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventorySalesAnalysis;
