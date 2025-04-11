import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Download, BarChart2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock profit report data
const mockProfitData = [
  {
    id: "1",
    itemName: "Kyocera TK-1175 Toner",
    category: "Toner",
    purchasePrice: 3200,
    sellingPrice: 3900,
    quantity: 12,
    profit: 8400,
    margin: 18.75,
  },
  {
    id: "2",
    itemName: "Canon NPG-59 Drum",
    category: "Drum",
    purchasePrice: 4200,
    sellingPrice: 5100,
    quantity: 8,
    profit: 7200,
    margin: 21.43,
  },
  {
    id: "3",
    itemName: "Ricoh SP 210 Toner",
    category: "Toner",
    purchasePrice: 2400,
    sellingPrice: 2980,
    quantity: 15,
    profit: 8700,
    margin: 24.17,
  },
  {
    id: "4",
    itemName: "HP CF217A Toner",
    category: "Toner",
    purchasePrice: 1800,
    sellingPrice: 2350,
    quantity: 20,
    profit: 11000,
    margin: 30.56,
  },
  {
    id: "5",
    itemName: "Xerox 3020 Drum Unit",
    category: "Drum",
    purchasePrice: 3500,
    sellingPrice: 4200,
    quantity: 6,
    profit: 4200,
    margin: 20.00,
  },
];

const ProfitReport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("month");
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredData = mockProfitData.filter(item => 
    searchQuery ? 
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    : true
  );
  
  const calculateTotalProfit = () => {
    return filteredData.reduce((sum, item) => sum + item.profit, 0);
  };
  
  const calculateAverageMargin = () => {
    if (filteredData.length === 0) return 0;
    const totalMargin = filteredData.reduce((sum, item) => sum + item.margin, 0);
    return (totalMargin / filteredData.length).toFixed(2);
  };
  
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Spare Part Profit Report</h1>
          <p className="text-muted-foreground">
            Analyze profit margins and performance of spare parts sales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="flex items-center gap-1 bg-black text-white hover:bg-black/90">
            <BarChart2 className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-sm font-medium text-muted-foreground">Total Profit</h2>
              <p className="text-3xl font-bold">{formatCurrency(calculateTotalProfit())}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-sm font-medium text-muted-foreground">Average Margin</h2>
              <p className="text-3xl font-bold">{calculateAverageMargin()}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-sm font-medium text-muted-foreground">Total Items Sold</h2>
              <p className="text-3xl font-bold">{filteredData.reduce((sum, item) => sum + item.quantity, 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filter row */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <Select 
            value={dateRange} 
            onValueChange={setDateRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="toner">Toners</TabsTrigger>
          <TabsTrigger value="drum">Drums</TabsTrigger>
          <TabsTrigger value="parts">Other Parts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit Analysis</CardTitle>
              <CardDescription>
                Complete breakdown of profit margins by spare part
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Total Profit</TableHead>
                    <TableHead>Margin %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{formatCurrency(item.purchasePrice)}</TableCell>
                      <TableCell>{formatCurrency(item.sellingPrice)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.profit)}</TableCell>
                      <TableCell className="font-medium">{item.margin.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Other tab content would be similar */}
        <TabsContent value="toner" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Toner Profit Analysis</CardTitle>
              <CardDescription>
                Profit margins for toner cartridges and supplies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Total Profit</TableHead>
                    <TableHead>Margin %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData
                    .filter(item => item.category === "Toner")
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell>{formatCurrency(item.purchasePrice)}</TableCell>
                        <TableCell>{formatCurrency(item.sellingPrice)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.profit)}</TableCell>
                        <TableCell className="font-medium">{item.margin.toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  
                  {filteredData.filter(item => item.category === "Toner").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No toners found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Simplified placeholder content for other tabs */}
        <TabsContent value="drum" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Drum Profit Analysis</CardTitle>
              <CardDescription>
                Profit margins for drum units and imaging components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Drum units profit data would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="parts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Other Parts Profit Analysis</CardTitle>
              <CardDescription>
                Profit margins for miscellaneous parts and components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Other parts profit data would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfitReport;
