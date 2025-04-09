
import React from "react";
import Layout from "@/components/layout/Layout";
import { 
  Package, 
  PlusCircle, 
  BarChart3, 
  Truck, 
  AlertTriangle,
  Search
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InventoryTable from "@/components/inventory/InventoryTable";
import InventoryOverview from "@/components/inventory/InventoryOverview";
import LowStockItems from "@/components/inventory/LowStockItems";

const Inventory = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground">
              Track stock levels, manage products, and handle inventory across locations.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-1">
              <Truck size={16} />
              <span>New Purchase</span>
            </Button>
            <Button className="flex items-center gap-1">
              <PlusCircle size={16} />
              <span>Add Product</span>
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 w-full bg-background"
            />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="toner">Toners</SelectItem>
                <SelectItem value="drum">Drums</SelectItem>
                <SelectItem value="spare">Spare Parts</SelectItem>
                <SelectItem value="machine">Machines</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="indore">Indore (HQ)</SelectItem>
                <SelectItem value="bhopal">Bhopal Office</SelectItem>
                <SelectItem value="jabalpur">Jabalpur Office</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Inventory Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">234</div>
              <p className="text-xs text-muted-foreground">
                Across all categories and locations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">8</div>
              <p className="text-xs text-muted-foreground">
                Items below minimum stock levels
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹24,51,250</div>
              <p className="text-xs text-muted-foreground">
                Estimated inventory worth
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">
                Transactions in last 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Overview */}
          <div className="lg:col-span-2">
            <InventoryOverview />
          </div>

          {/* Low Stock Items */}
          <div>
            <LowStockItems />
          </div>
        </div>

        {/* Inventory Table */}
        <InventoryTable />
      </div>
    </Layout>
  );
};

export default Inventory;
