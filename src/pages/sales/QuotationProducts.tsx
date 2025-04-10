
import React, { useState } from "react";
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Search, PlusCircle, Printer, Package, Tag, FileText, Edit, Trash
} from "lucide-react";
import { products } from "@/data/salesData";
import { ProductCategory, ProductStatus } from "@/types/sales";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const QuotationProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "All">("All");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  
  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get status badge based on product status
  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case "Active":
        return <Badge variant="success" className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case "Discontinued":
        return <Badge variant="destructive">Discontinued</Badge>;
      case "Coming Soon":
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Coming Soon</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Product form
  const form = useForm({
    defaultValues: {
      name: "",
      category: "Copier" as ProductCategory,
      status: "Active" as ProductStatus,
      isInventoryItem: false,
      defaultGstPercent: 18,
      speed: "",
      color: false,
      ram: "",
      paperTray: "",
      duplex: false,
      additionalSpecs: ""
    }
  });
  
  const onSubmit = (data: any) => {
    console.log("Form data:", data);
    toast.success("Product saved successfully");
    setProductDialogOpen(false);
    form.reset();
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
        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your quotation catalog
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter product name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Copier">Copier</SelectItem>
                            <SelectItem value="Printer">Printer</SelectItem>
                            <SelectItem value="Finishing Machine">Finishing Machine</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="defaultGstPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default GST %</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Discontinued">Discontinued</SelectItem>
                            <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isInventoryItem" 
                    checked={form.watch("isInventoryItem")}
                    onCheckedChange={(checked) => form.setValue("isInventoryItem", checked as boolean)}
                  />
                  <Label htmlFor="isInventoryItem">Track this product in inventory</Label>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Product Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="speed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Speed</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. 25 ppm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Color Capability
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RAM</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. 4 GB" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paperTray"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paper Tray</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. 2 x 500 sheets" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="duplex"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Duplex Printing
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="additionalSpecs"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Additional Specifications</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Enter any additional specifications"
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setProductDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Product</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Tabs for different views */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            All Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={categoryFilter === "All" ? "default" : "outline"} 
                onClick={() => setCategoryFilter("All")}
              >
                All
              </Button>
              <Button 
                variant={categoryFilter === "Copier" ? "default" : "outline"} 
                onClick={() => setCategoryFilter("Copier")}
              >
                Copiers
              </Button>
              <Button 
                variant={categoryFilter === "Printer" ? "default" : "outline"} 
                onClick={() => setCategoryFilter("Printer")}
              >
                Printers
              </Button>
              <Button 
                variant={categoryFilter === "Finishing Machine" ? "default" : "outline"} 
                onClick={() => setCategoryFilter("Finishing Machine")}
              >
                Finishing
              </Button>
            </div>
          </div>
          
          {/* Products table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Specifications</TableHead>
                  <TableHead>GST %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
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
                          {product.specs.paperTray && (
                            <div><span className="font-medium">Paper Tray:</span> {product.specs.paperTray}</div>
                          )}
                          {product.specs.duplex !== undefined && (
                            <div><span className="font-medium">Duplex:</span> {product.specs.duplex ? 'Yes' : 'No'}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{product.defaultGstPercent}%</TableCell>
                      <TableCell>
                        {getStatusBadge(product.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <Package className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>No products found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="categories" className="mt-4">
          <div className="border rounded-md p-6 text-center">
            <Tag className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <h3 className="text-lg font-medium">Categories Management</h3>
            <p className="text-muted-foreground mb-4">
              Organize your products into categories
            </p>
            <Button>Manage Categories</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="mt-4">
          <div className="border rounded-md p-6 text-center">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <h3 className="text-lg font-medium">Quotation Templates</h3>
            <p className="text-muted-foreground mb-4">
              Create and manage templates for quick quotation generation
            </p>
            <Button>Manage Templates</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuotationProducts;
