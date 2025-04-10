
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
  Search, PlusCircle, Printer, Package, Tag, FileText, Edit, Trash, FolderPlus,
  FilePlus, Move, Copy, AlertCircle, CheckCircle2, Settings
} from "lucide-react";
import { products } from "@/data/salesData";
import { ProductCategory, ProductStatus } from "@/types/sales";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const QuotationProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "All">("All");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateView, setTemplateView] = useState<"grid" | "list">("grid");
  
  // Category management
  const [categories, setCategories] = useState<{id: string; name: string; count: number; color: string}[]>([
    { id: "1", name: "Copier", count: 5, color: "#8B5CF6" },
    { id: "2", name: "Printer", count: 3, color: "#0EA5E9" },
    { id: "3", name: "Finishing Machine", count: 2, color: "#F97316" },
    { id: "4", name: "Other", count: 1, color: "#8E9196" }
  ]);
  
  // Templates management
  const [templates, setTemplates] = useState<{id: string; name: string; description: string; products: number; lastModified: string}[]>([
    { 
      id: "1", 
      name: "Canon Standard Package", 
      description: "Standard package for Canon copiers with consumables", 
      products: 3,
      lastModified: "2023-10-15"
    },
    { 
      id: "2", 
      name: "Kyocera Office Setup", 
      description: "Complete office setup with Kyocera products", 
      products: 5,
      lastModified: "2023-11-20"
    },
    { 
      id: "3", 
      name: "HP Enterprise Bundle", 
      description: "Enterprise-grade HP printers and accessories", 
      products: 4,
      lastModified: "2023-12-05"
    }
  ]);
  
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
  const productForm = useForm({
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
  
  // Category form
  const categoryForm = useForm({
    defaultValues: {
      name: "",
      color: "#8B5CF6"
    }
  });
  
  // Template form
  const templateForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      products: []
    }
  });
  
  const onProductSubmit = (data: any) => {
    console.log("Product data:", data);
    toast.success("Product saved successfully");
    setProductDialogOpen(false);
    productForm.reset();
  };
  
  const onCategorySubmit = (data: any) => {
    console.log("Category data:", data);
    const newCategory = {
      id: Date.now().toString(),
      name: data.name,
      count: 0,
      color: data.color
    };
    setCategories([...categories, newCategory]);
    toast.success("Category added successfully");
    setCategoryDialogOpen(false);
    categoryForm.reset();
  };
  
  const onTemplateSubmit = (data: any) => {
    console.log("Template data:", data);
    const newTemplate = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      products: data.products.length,
      lastModified: new Date().toISOString().split('T')[0]
    };
    setTemplates([...templates, newTemplate]);
    toast.success("Template added successfully");
    setTemplateDialogOpen(false);
    templateForm.reset();
  };
  
  const deleteCategory = (id: string) => {
    setCategories(categories.filter(category => category.id !== id));
    toast.success("Category deleted");
  };
  
  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
    toast.success("Template deleted");
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
            
            <Form {...productForm}>
              <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={productForm.control}
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
                    control={productForm.control}
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
                    control={productForm.control}
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
                    control={productForm.control}
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
                    checked={productForm.watch("isInventoryItem")}
                    onCheckedChange={(checked) => productForm.setValue("isInventoryItem", checked as boolean)}
                  />
                  <Label htmlFor="isInventoryItem">Track this product in inventory</Label>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Product Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
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
                      control={productForm.control}
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
                      control={productForm.control}
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
                      control={productForm.control}
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
                      control={productForm.control}
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
                      control={productForm.control}
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-medium">Product Categories</h2>
              <p className="text-muted-foreground text-sm">
                Organize your products into categories for easier management
              </p>
            </div>
            
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1">
                  <FolderPlus className="h-4 w-4" />
                  New Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new category to organize your products
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...categoryForm}>
                  <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-6 py-4">
                    <FormField
                      control={categoryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter category name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={categoryForm.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Color</FormLabel>
                          <div className="flex gap-2">
                            {["#8B5CF6", "#0EA5E9", "#F97316", "#10B981", "#EF4444", "#8E9196"].map((color) => (
                              <div 
                                key={color}
                                className={`h-8 w-8 rounded-full cursor-pointer border-2 ${field.value === color ? 'border-black' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                                onClick={() => categoryForm.setValue("color", color)}
                              />
                            ))}
                          </div>
                          <FormDescription>
                            Select a color to visually identify this category
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setCategoryDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save Category</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteCategory(category.id)} className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {category.count} products
                    </div>
                    <Badge variant="outline">{category.count > 0 ? "Active" : "Empty"}</Badge>
                  </div>
                </CardContent>
                <CardFooter className="pt-1">
                  <Button variant="outline" size="sm" className="w-full">
                    View Products
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-[150px]">
                <Button 
                  variant="ghost" 
                  className="h-full w-full flex flex-col gap-2"
                  onClick={() => setCategoryDialogOpen(true)}
                >
                  <FolderPlus className="h-8 w-8" />
                  <span>Add New Category</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="mt-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-medium">Quotation Templates</h2>
              <p className="text-muted-foreground text-sm">
                Create and manage templates for quick quotation generation
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex border rounded-md overflow-hidden">
                <Button 
                  variant={templateView === "grid" ? "default" : "outline"}
                  className="rounded-none px-3"
                  onClick={() => setTemplateView("grid")}
                >
                  <div className="grid grid-cols-2 gap-0.5 h-4 w-4">
                    <div className="bg-current"></div>
                    <div className="bg-current"></div>
                    <div className="bg-current"></div>
                    <div className="bg-current"></div>
                  </div>
                </Button>
                <Button 
                  variant={templateView === "list" ? "default" : "outline"}
                  className="rounded-none px-3"
                  onClick={() => setTemplateView("list")}
                >
                  <div className="flex flex-col gap-0.5 h-4 w-4 justify-center">
                    <div className="h-0.5 bg-current"></div>
                    <div className="h-0.5 bg-current"></div>
                    <div className="h-0.5 bg-current"></div>
                  </div>
                </Button>
              </div>
              
              <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-1">
                    <FilePlus className="h-4 w-4" />
                    New Template
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Quotation Template</DialogTitle>
                    <DialogDescription>
                      Create a template with pre-selected products for quick quotation creation
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...templateForm}>
                    <form onSubmit={templateForm.handleSubmit(onTemplateSubmit)} className="space-y-6 py-4">
                      <FormField
                        control={templateForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter template name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={templateForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Enter template description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormItem>
                        <FormLabel>Select Products</FormLabel>
                        <div className="bg-muted/50 p-4 rounded-md border">
                          <div className="text-center text-muted-foreground">
                            <Package className="h-8 w-8 mx-auto mb-1 opacity-50" />
                            <p>Product selection will be implemented here</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              Add Products
                            </Button>
                          </div>
                        </div>
                      </FormItem>
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setTemplateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Template</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {templateView === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => deleteTemplate(template.id)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {template.products} products
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last modified: {template.lastModified}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-1 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Printer className="mr-2 h-4 w-4" />
                      Use
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-[200px]">
                  <Button 
                    variant="ghost" 
                    className="h-full w-full flex flex-col gap-2"
                    onClick={() => setTemplateDialogOpen(true)}
                  >
                    <FilePlus className="h-8 w-8" />
                    <span>Create New Template</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.description}</TableCell>
                      <TableCell>{template.products}</TableCell>
                      <TableCell>{template.lastModified}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm">
                            <Printer className="h-4 w-4 mr-1" />
                            Use
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => deleteTemplate(template.id)} className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuotationProducts;
