
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, PlusCircle, Filter, ArrowUpDown } from "lucide-react";
import { products } from "@/data/salesData";
import { ProductCategory, ProductStatus } from "@/types/sales";

const ProductCatalog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "All">("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
          <h1 className="text-2xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-muted-foreground">
            Explore our range of copiers, printers, and finishing machines
          </p>
        </div>
        <Button className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={categoryFilter === "All" ? "default" : "outline"}
            onClick={() => setCategoryFilter("All")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={categoryFilter === "Copier" ? "default" : "outline"}
            onClick={() => setCategoryFilter("Copier")}
            size="sm"
          >
            Copiers
          </Button>
          <Button
            variant={categoryFilter === "Printer" ? "default" : "outline"}
            onClick={() => setCategoryFilter("Printer")}
            size="sm"
          >
            Printers
          </Button>
          <Button
            variant={categoryFilter === "Finishing Machine" ? "default" : "outline"}
            onClick={() => setCategoryFilter("Finishing Machine")}
            size="sm"
          >
            Finishing
          </Button>
        </div>

        <div className="flex items-center ml-auto">
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
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>{product.category}</CardDescription>
                  </div>
                  {getStatusBadge(product.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-2">
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
                    Product
                    {sortField === "name" && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Speed</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>RAM</TableHead>
                <TableHead>Paper Tray</TableHead>
                <TableHead>Duplex</TableHead>
                <TableHead>GST %</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.specs.speed || "-"}</TableCell>
                  <TableCell>{product.specs.color ? "Yes" : "No"}</TableCell>
                  <TableCell>{product.specs.ram || "-"}</TableCell>
                  <TableCell>{product.specs.paperTray || "-"}</TableCell>
                  <TableCell>{product.specs.duplex ? "Yes" : "No"}</TableCell>
                  <TableCell>{product.defaultGstPercent}%</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
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
