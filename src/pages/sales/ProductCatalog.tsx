
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, PlusCircle, Package, Tag, FileText, ArrowUpDown } from "lucide-react";
import { products } from "@/data/salesData";
import { ProductCategory, ProductStatus } from "@/types/sales";

const ProductCatalog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "All">("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<"all" | "categories" | "templates">("all");

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    // Add more sort fields if needed
    return 0;
  });

  // Toggle sort direction
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Generate status badge
  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case "Active":
        return <Badge variant="success" className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case "Discontinued":
        return <Badge variant="destructive">Discontinued</Badge>;
      case "Coming Soon":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Coming Soon</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotation Products</h1>
          <p className="text-muted-foreground">
            Manage product catalog for quotations and purchase orders
          </p>
        </div>
        <Button className="flex items-center gap-1 bg-black text-white hover:bg-black/90">
          <PlusCircle className="h-4 w-4" />
          New Product
        </Button>
      </div>

      {/* Navigation tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button
            className={`flex items-center gap-2 py-3 px-1 border-b-2 ${
              activeTab === "all" 
                ? "border-black text-black" 
                : "border-transparent text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("all")}
          >
            <Package className="h-5 w-5" />
            All Products
          </button>
          <button
            className={`flex items-center gap-2 py-3 px-1 border-b-2 ${
              activeTab === "categories" 
                ? "border-black text-black" 
                : "border-transparent text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("categories")}
          >
            <Tag className="h-5 w-5" />
            Categories
          </button>
          <button
            className={`flex items-center gap-2 py-3 px-1 border-b-2 ${
              activeTab === "templates" 
                ? "border-black text-black" 
                : "border-transparent text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("templates")}
          >
            <FileText className="h-5 w-5" />
            Templates
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant={categoryFilter === "All" ? "default" : "outline"}
            onClick={() => setCategoryFilter("All")}
            className={categoryFilter === "All" ? "bg-black text-white hover:bg-black/90" : ""}
          >
            All
          </Button>
          <Button
            variant={categoryFilter === "Copier" ? "default" : "outline"}
            onClick={() => setCategoryFilter("Copier")}
            className={categoryFilter === "Copier" ? "bg-black text-white hover:bg-black/90" : ""}
          >
            Copiers
          </Button>
          <Button
            variant={categoryFilter === "Printer" ? "default" : "outline"}
            onClick={() => setCategoryFilter("Printer")}
            className={categoryFilter === "Printer" ? "bg-black text-white hover:bg-black/90" : ""}
          >
            Printers
          </Button>
          <Button
            variant={categoryFilter === "Finishing Machine" ? "default" : "outline"}
            onClick={() => setCategoryFilter("Finishing Machine")}
            className={categoryFilter === "Finishing Machine" ? "bg-black text-white hover:bg-black/90" : ""}
          >
            Finishing
          </Button>
        </div>

        <div className="flex items-center ml-4">
          <Tabs defaultValue="grid" onValueChange={(v) => setViewMode(v as "grid" | "table")}>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Product display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  {getStatusBadge(product.status)}
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {product.specs.speed && (
                      <div>
                        <span className="font-medium">Speed:</span> {product.specs.speed}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Color:</span> {product.specs.color ? "Yes" : "No"}
                    </div>
                    {product.specs.ram && (
                      <div>
                        <span className="font-medium">RAM:</span> {product.specs.ram}
                      </div>
                    )}
                    {product.specs.paperTray && (
                      <div>
                        <span className="font-medium">Paper Tray:</span> {product.specs.paperTray}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Duplex:</span> {product.specs.duplex ? "Yes" : "No"}
                    </div>
                    <div>
                      <span className="font-medium">GST:</span> {product.defaultGstPercent}%
                    </div>
                    {product.specs.additionalSpecs && Object.entries(product.specs.additionalSpecs).map(([key, value]) => (
                      <div key={key} className="col-span-2">
                        <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] cursor-pointer" onClick={() => toggleSort("name")}>
                  <div className="flex items-center">
                    Product Name
                    {sortField === "name" && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Specifications</TableHead>
                <TableHead>GST %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      {product.specs.speed && (
                        <div><span className="font-medium">Speed:</span> {product.specs.speed}</div>
                      )}
                      {product.specs.color !== undefined && (
                        <div><span className="font-medium">Color:</span> {product.specs.color ? 'Yes' : 'No'}</div>
                      )}
                      {product.specs.ram && (
                        <div><span className="font-medium">RAM:</span> {product.specs.ram}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{product.defaultGstPercent}%</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
