
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { PlusCircle, Edit, Trash, Tag, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brand, Model } from "@/types/inventory";

// Mock data for testing UI
const mockBrands: Brand[] = [
  { id: "1", name: "Kyocera", createdAt: "2025-03-01" },
  { id: "2", name: "Ricoh", createdAt: "2025-03-02" },
  { id: "3", name: "Canon", createdAt: "2025-03-03" },
  { id: "4", name: "Xerox", createdAt: "2025-03-04" },
  { id: "5", name: "Samsung", createdAt: "2025-03-05" },
];

const mockModels: Model[] = [
  { id: "1", brandId: "1", name: "2554ci", type: "Machine", createdAt: "2025-03-01" },
  { id: "2", brandId: "1", name: "3252ci", type: "Machine", createdAt: "2025-03-02" },
  { id: "3", brandId: "2", name: "MP2014", type: "Machine", createdAt: "2025-03-03" },
  { id: "4", brandId: "3", name: "2525", type: "Machine", createdAt: "2025-03-04" },
  { id: "5", brandId: "4", name: "7845", type: "Machine", createdAt: "2025-03-05" },
];

const InventoryBrands = () => {
  const [openBrandDialog, setOpenBrandDialog] = useState(false);
  const [openModelDialog, setOpenModelDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brands] = useState<Brand[]>(mockBrands);
  const [models] = useState<Model[]>(mockModels);
  const [newBrand, setNewBrand] = useState({ name: "" });
  const [newModel, setNewModel] = useState({ brandId: "", name: "", type: "Machine" as "Machine" | "Spare Part" });

  const handleBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save to the database
    console.log("Saving brand:", selectedBrand ? "Update" : "New", newBrand);
    setOpenBrandDialog(false);
    setNewBrand({ name: "" });
    setSelectedBrand(null);
  };

  const handleModelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save to the database
    console.log("Saving model:", newModel);
    setOpenModelDialog(false);
    setNewModel({ brandId: "", name: "", type: "Machine" });
  };

  const openEditBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setNewBrand({ name: brand.name });
    setOpenBrandDialog(true);
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
              <Dialog open={openBrandDialog} onOpenChange={setOpenBrandDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Brand</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleBrandSubmit}>
                    <DialogHeader>
                      <DialogTitle>{selectedBrand ? "Edit Brand" : "Add New Brand"}</DialogTitle>
                      <DialogDescription>
                        Enter the brand details below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand-name">Brand Name</Label>
                        <Input
                          id="brand-name"
                          value={newBrand.name}
                          onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                          placeholder="e.g. Kyocera, Ricoh, Canon"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">
                        {selectedBrand ? "Update Brand" : "Add Brand"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
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
                  {brands.map((brand) => (
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
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <Dialog open={openModelDialog} onOpenChange={setOpenModelDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Model</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleModelSubmit}>
                    <DialogHeader>
                      <DialogTitle>Add New Model</DialogTitle>
                      <DialogDescription>
                        Create a new model for a specific brand.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="model-brand">Select Brand</Label>
                        <Select 
                          value={newModel.brandId} 
                          onValueChange={(value) => setNewModel({ ...newModel, brandId: value })}
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
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model-name">Model Name/Number</Label>
                        <Input
                          id="model-name"
                          value={newModel.name}
                          onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                          placeholder="e.g. 2554ci, MP2014"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model-type">Type</Label>
                        <Select 
                          value={newModel.type} 
                          onValueChange={(value) => setNewModel({ ...newModel, type: value as "Machine" | "Spare Part" })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Machine">Machine</SelectItem>
                            <SelectItem value="Spare Part">Spare Part</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Add Model</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
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
                  {models.map((model) => {
                    const brand = brands.find(b => b.id === model.brandId);
                    return (
                      <TableRow key={model.id}>
                        <TableCell>{brand?.name || "Unknown"}</TableCell>
                        <TableCell className="font-medium">{model.name}</TableCell>
                        <TableCell>
                          <Badge variant={model.type === "Machine" ? "default" : "secondary"}>
                            {model.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(model.createdAt).toLocaleDateString()}</TableCell>
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
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryBrands;
