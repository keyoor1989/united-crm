import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash, Tag, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brand, Model } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required")
});

const modelSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  name: z.string().min(1, "Model name is required"),
  type: z.enum(["Machine", "Spare Part"])
});

const InventoryBrands = () => {
  const [openBrandDialog, setOpenBrandDialog] = useState(false);
  const [openModelDialog, setOpenModelDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null);

  const brandForm = useForm<z.infer<typeof brandSchema>>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: ""
    }
  });

  const modelForm = useForm<z.infer<typeof modelSchema>>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      brandId: "",
      name: "",
      type: "Machine"
    }
  });

  // Fetch brands and models data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('inventory_brands')
        .select('*')
        .order('name');

      if (brandsError) throw brandsError;
      
      // Fetch models
      const { data: modelsData, error: modelsError } = await supabase
        .from('inventory_models')
        .select('*')
        .order('name');

      if (modelsError) throw modelsError;
      
      // Transform data to match our type definitions
      const transformedBrands: Brand[] = brandsData.map(brand => ({
        id: brand.id,
        name: brand.name,
        createdAt: brand.created_at,
        updatedAt: brand.updated_at
      }));
      
      const transformedModels: Model[] = modelsData.map(model => ({
        id: model.id,
        brandId: model.brand_id,
        name: model.name,
        type: model.type as 'Machine' | 'Spare Part',
        createdAt: model.created_at,
        updatedAt: model.updated_at
      }));
      
      setBrands(transformedBrands);
      setModels(transformedModels);
    } catch (error) {
      toast.error("Failed to load data");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Brand form handling
  const openEditBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    brandForm.reset({ name: brand.name });
    setOpenBrandDialog(true);
  };

  const openAddBrand = () => {
    setSelectedBrand(null);
    brandForm.reset({ name: "" });
    setOpenBrandDialog(true);
  };

  const handleBrandSubmit = async (values: z.infer<typeof brandSchema>) => {
    try {
      if (selectedBrand) {
        // Update existing brand
        const { error } = await supabase
          .from('inventory_brands')
          .update({ 
            name: values.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedBrand.id);

        if (error) throw error;
        toast.success("Brand updated successfully");
      } else {
        // Create new brand
        const { error } = await supabase
          .from('inventory_brands')
          .insert({ name: values.name });

        if (error) throw error;
        toast.success("Brand added successfully");
      }
      
      setOpenBrandDialog(false);
      fetchData();
    } catch (error) {
      toast.error(selectedBrand ? "Failed to update brand" : "Failed to add brand");
      console.error("Error saving brand:", error);
    }
  };

  const openDeleteBrandDialog = (brand: Brand) => {
    setBrandToDelete(brand);
    setOpenDeleteDialog(true);
  };

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return;
    
    try {
      const { error } = await supabase
        .from('inventory_brands')
        .delete()
        .eq('id', brandToDelete.id);

      if (error) throw error;
      
      toast.success("Brand deleted successfully");
      setOpenDeleteDialog(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete brand");
      console.error("Error deleting brand:", error);
    }
  };

  // Model form handling
  const openAddModel = () => {
    setSelectedModel(null);
    modelForm.reset({
      brandId: "",
      name: "",
      type: "Machine"
    });
    setOpenModelDialog(true);
  };

  const openEditModel = (model: Model) => {
    setSelectedModel(model);
    modelForm.reset({
      brandId: model.brandId,
      name: model.name,
      type: model.type
    });
    setOpenModelDialog(true);
  };

  const handleModelSubmit = async (values: z.infer<typeof modelSchema>) => {
    try {
      if (selectedModel) {
        // Update existing model
        const { error } = await supabase
          .from('inventory_models')
          .update({ 
            brand_id: values.brandId,
            name: values.name,
            type: values.type,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedModel.id);

        if (error) throw error;
        toast.success("Model updated successfully");
      } else {
        // Create new model
        const { error } = await supabase
          .from('inventory_models')
          .insert({ 
            brand_id: values.brandId, 
            name: values.name, 
            type: values.type 
          });

        if (error) throw error;
        toast.success("Model added successfully");
      }
      
      setOpenModelDialog(false);
      fetchData();
    } catch (error) {
      toast.error(selectedModel ? "Failed to update model" : "Failed to add model");
      console.error("Error saving model:", error);
    }
  };

  const openDeleteModelDialog = (model: Model) => {
    setModelToDelete(model);
    setOpenDeleteDialog(true);
  };

  const handleDeleteModel = async () => {
    if (!modelToDelete) return;
    
    try {
      const { error } = await supabase
        .from('inventory_models')
        .delete()
        .eq('id', modelToDelete.id);

      if (error) throw error;
      
      toast.success("Model deleted successfully");
      setOpenDeleteDialog(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete model");
      console.error("Error deleting model:", error);
    }
  };

  // Get brand name by ID
  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    return brand?.name || "Unknown";
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Brands & Models</h1>
          <p className="text-muted-foreground">Manage your inventory brands and models</p>
        </div>
      </div>

      <Tabs defaultValue="brands">
        <TabsList className="mb-4">
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        <TabsContent value="brands">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Brands</CardTitle>
                <CardDescription>Add, edit or delete copier brands</CardDescription>
              </div>
              <Button onClick={openAddBrand} className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                <span>Add Brand</span>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4">Loading brands...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand Name</TableHead>
                      <TableHead>Total Models</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brands.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No brands found. Add your first brand to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      brands.map((brand) => (
                        <TableRow key={brand.id}>
                          <TableCell className="font-medium">{brand.name}</TableCell>
                          <TableCell>
                            {models.filter(model => model.brandId === brand.id).length}
                          </TableCell>
                          <TableCell>{new Date(brand.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditBrand(brand)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => openDeleteBrandDialog(brand)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Models</CardTitle>
                <CardDescription>Manage machine and spare part models</CardDescription>
              </div>
              <Button onClick={openAddModel} className="flex items-center gap-1" disabled={brands.length === 0}>
                <PlusCircle className="h-4 w-4" />
                <span>Add Model</span>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4">Loading models...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand</TableHead>
                      <TableHead>Model Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {models.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          {brands.length === 0 
                            ? "Add brands first before creating models." 
                            : "No models found. Add your first model to get started."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      models.map((model) => (
                        <TableRow key={model.id}>
                          <TableCell>{getBrandName(model.brandId)}</TableCell>
                          <TableCell className="font-medium">{model.name}</TableCell>
                          <TableCell>
                            <Badge variant={model.type === "Machine" ? "default" : "secondary"}>
                              {model.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(model.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditModel(model)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => openDeleteModelDialog(model)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Brand Form Dialog */}
      <Dialog open={openBrandDialog} onOpenChange={setOpenBrandDialog}>
        <DialogContent>
          <Form {...brandForm}>
            <form onSubmit={brandForm.handleSubmit(handleBrandSubmit)}>
              <DialogHeader>
                <DialogTitle>{selectedBrand ? "Edit Brand" : "Add New Brand"}</DialogTitle>
                <DialogDescription>
                  Enter the brand details below.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <FormField
                  control={brandForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g. Kyocera, Ricoh, Canon" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={brandForm.formState.isSubmitting}>
                  {selectedBrand ? "Update Brand" : "Add Brand"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Model Form Dialog */}
      <Dialog open={openModelDialog} onOpenChange={setOpenModelDialog}>
        <DialogContent>
          <Form {...modelForm}>
            <form onSubmit={modelForm.handleSubmit(handleModelSubmit)}>
              <DialogHeader>
                <DialogTitle>{selectedModel ? "Edit Model" : "Add New Model"}</DialogTitle>
                <DialogDescription>
                  Create a new model for a specific brand.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <FormField
                  control={modelForm.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Brand</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={modelForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Name/Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 2554ci, MP2014"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={modelForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Machine">Machine</SelectItem>
                            <SelectItem value="Spare Part">Spare Part</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={modelForm.formState.isSubmitting}>
                  {selectedModel ? "Update Model" : "Add Model"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {brandToDelete 
                ? `Are you sure you want to delete the brand "${brandToDelete.name}"? This will also delete all associated models.` 
                : modelToDelete 
                  ? `Are you sure you want to delete the model "${modelToDelete.name}"?` 
                  : "Are you sure you want to delete this item?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={brandToDelete ? handleDeleteBrand : handleDeleteModel}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryBrands;
