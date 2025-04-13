import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Brand, Model, dbAdapter } from "@/types/inventory";

const InventoryBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(true);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [modelName, setModelName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [modelType, setModelType] = useState<"Machine" | "Spare Part">("Spare Part");

  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const { data, error } = await supabase
          .from('inventory_brands')
          .select('*')
          .order('name');

        if (error) {
          console.error("Error fetching brands:", error);
          toast.error("Failed to fetch brands. Please try again.");
        } else {
          const brandData = (data || []).map(brand => dbAdapter.adaptBrand(brand));
          setBrands(brandData);
        }
      } finally {
        setLoadingBrands(false);
      }
    };

    const fetchModels = async () => {
      setLoadingModels(true);
      try {
        const { data, error } = await supabase
          .from('inventory_models')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching models:", error);
          toast.error("Failed to fetch models. Please try again.");
        } else {
          const modelData = (data || []).map(model => dbAdapter.adaptModel(model));
          setModels(modelData);
        }
      } finally {
        setLoadingModels(false);
      }
    };

    fetchBrands();
    fetchModels();
  }, []);

  const handleAddBrand = async () => {
    if (!brandName) {
      toast.error("Brand name is required");
      return;
    }

    try {
      const { error } = await supabase
        .from('inventory_brands')
        .insert([{ name: brandName }]);

      if (error) {
        console.error("Error adding brand:", error);
        toast.error("Failed to add brand. Please try again.");
      } else {
        toast.success("Brand added successfully.");
        setBrandDialogOpen(false);
        setBrandName("");
        const { data } = await supabase
          .from('inventory_brands')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data) {
          const brandData = data.map(brand => dbAdapter.adaptBrand(brand));
          setBrands(brandData);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleAddModel = () => {
    if (!selectedBrand) {
      toast.error("Please select a brand first");
      return;
    }
    
    if (!modelName) {
      toast.error("Model name is required");
      return;
    }
    
    const typedModelType = (modelType as "Machine" | "Spare Part") || "Spare Part";
    
    const addModel = async () => {
      try {
        const { error } = await supabase
          .from('inventory_models')
          .insert([{ brand_id: selectedBrand, name: modelName, type: typedModelType }]);
  
        if (error) {
          console.error("Error adding model:", error);
          toast.error("Failed to add model. Please try again.");
        } else {
          toast.success("Model added successfully.");
          setModelDialogOpen(false);
          setModelName("");
          const { data } = await supabase
            .from('inventory_models')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (data) {
            const modelData = data.map(model => dbAdapter.adaptModel(model));
            setModels(modelData);
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    };

    addModel();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Inventory Brands & Models | Inventory Management</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-medium">Manage Inventory Brands and Models</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brands</CardTitle>
          <CardDescription>
            Manage the brands of your inventory items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button onClick={() => setBrandDialogOpen(true)}>Add Brand</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingBrands ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">Loading brands...</TableCell>
                </TableRow>
              ) : brands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">No brands found.</TableCell>
                </TableRow>
              ) : (
                brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell>{new Date(brand.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Models</CardTitle>
          <CardDescription>
            Manage the models of your inventory items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-4">
            <div>
              <Label htmlFor="brand">Select Brand:</Label>
              <select
                id="brand"
                className="ml-2 p-2 border rounded"
                onChange={(e) => setSelectedBrand(e.target.value)}
                value={selectedBrand || ""}
              >
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
            <Button onClick={() => setModelDialogOpen(true)} disabled={!selectedBrand}>Add Model</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingModels ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Loading models...</TableCell>
                </TableRow>
              ) : models.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No models found.</TableCell>
                </TableRow>
              ) : (
                models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>{model.type}</TableCell>
                    <TableCell>{new Date(model.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Brand</DialogTitle>
            <DialogDescription>
              Add a new brand to the inventory system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brandName" className="text-right">Name</Label>
              <Input
                type="text"
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <Button type="button" onClick={handleAddBrand}>Add Brand</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={modelDialogOpen} onOpenChange={setModelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Model</DialogTitle>
            <DialogDescription>
              Add a new model to the inventory system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="modelName" className="text-right">Name</Label>
              <Input
                type="text"
                id="modelName"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="modelType" className="text-right">Type</Label>
              <select
                id="modelType"
                className="col-span-3 p-2 border rounded"
                onChange={(e) => setModelType(e.target.value as "Machine" | "Spare Part")}
                value={modelType}
              >
                <option value="Spare Part">Spare Part</option>
                <option value="Machine">Machine</option>
              </select>
            </div>
          </div>
          <Button type="button" onClick={handleAddModel}>Add Model</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryBrands;
