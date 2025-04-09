
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { 
  Package, 
  PlusCircle, 
  BarChart3, 
  Truck, 
  AlertTriangle,
  Search,
  Filter
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

// Sample data for filtering
const categories = [
  { value: "all", label: "All Categories" },
  { value: "toner", label: "Toners" },
  { value: "drum", label: "Drums" },
  { value: "spare", label: "Spare Parts" },
  { value: "machine", label: "Machines" }
];

const locations = [
  { value: "all", label: "All Locations" },
  { value: "indore", label: "Indore (HQ)" },
  { value: "bhopal", label: "Bhopal Office" },
  { value: "jabalpur", label: "Jabalpur Office" }
];

const Inventory = () => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsFilterActive(!!e.target.value || categoryFilter !== "all" || locationFilter !== "all");
  };

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setIsFilterActive(!!searchQuery || value !== "all" || locationFilter !== "all");
  };

  // Handle location filter change
  const handleLocationChange = (value: string) => {
    setLocationFilter(value);
    setIsFilterActive(!!searchQuery || categoryFilter !== "all" || value !== "all");
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setLocationFilter("all");
    setIsFilterActive(false);
  };

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
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={handleLocationChange}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isFilterActive && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleResetFilters}
                className="flex items-center justify-center h-10 w-10 rounded-md"
                title="Clear filters"
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}
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

        {/* Inventory Table with filters */}
        <InventoryTable 
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          locationFilter={locationFilter}
        />
      </div>
    </Layout>
  );
};

export default Inventory;
