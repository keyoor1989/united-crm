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
import { Search, Filter, Plus, FileText, Settings, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock machine parts data
const mockMachineParts = [
  {
    id: "MP001",
    partNumber: "TK-1175",
    name: "Toner Kit",
    brand: "Kyocera",
    compatibleModels: ["ECOSYS M2040dn", "ECOSYS M2540dn", "ECOSYS M2640idw"],
    category: "Toner",
    currentStock: 15,
    minStock: 5,
  },
  {
    id: "MP002",
    partNumber: "DK-1150",
    name: "Drum Unit",
    brand: "Kyocera",
    compatibleModels: ["ECOSYS M2040dn", "ECOSYS M2540dn"],
    category: "Drum",
    currentStock: 8,
    minStock: 3,
  },
  {
    id: "MP003",
    partNumber: "MK-1140",
    name: "Maintenance Kit",
    brand: "Kyocera",
    compatibleModels: ["ECOSYS M2040dn"],
    category: "Maintenance Kit",
    currentStock: 4,
    minStock: 2,
  },
  {
    id: "MP004",
    partNumber: "NPG-59",
    name: "Drum Unit",
    brand: "Canon",
    compatibleModels: ["IR 2002", "IR 2004"],
    category: "Drum",
    currentStock: 6,
    minStock: 3,
  },
  {
    id: "MP005",
    partNumber: "Fixing Film",
    name: "Fixing Film Assembly",
    brand: "Canon",
    compatibleModels: ["IR 2002", "IR 2004", "IR 2006"],
    category: "Fuser",
    currentStock: 2,
    minStock: 1,
  },
];

const MachineParts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredParts = mockMachineParts.filter(part => 
    searchQuery ? 
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.brand.toLowerCase().includes(searchQuery.toLowerCase())
    : true
  );
  
  const getStockStatus = (current: number, min: number) => {
    if (current <= 0) {
      return { label: "Out of Stock", variant: "destructive" as const };
    } else if (current < min) {
      return { label: "Low Stock", variant: "warning" as const };
    } else {
      return { label: "In Stock", variant: "success" as const };
    }
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Machine Parts Catalog</h1>
          <p className="text-muted-foreground">
            Manage and organize parts for different machine models
          </p>
        </div>
        <Button className="flex items-center gap-1 bg-black text-white hover:bg-black/90">
          <Plus className="h-4 w-4" />
          Add New Part
        </Button>
      </div>

      {/* Search and filter row */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parts by name, number, or brand..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button variant="outline" className="sm:ml-auto flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Parts</TabsTrigger>
          <TabsTrigger value="toner">Toner</TabsTrigger>
          <TabsTrigger value="drum">Drums</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Kits</TabsTrigger>
          <TabsTrigger value="fuser">Fusers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Parts Catalog</CardTitle>
              <CardDescription>
                Complete listing of all machine parts in inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Compatible Models</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParts.map((part) => {
                    const stockStatus = getStockStatus(part.currentStock, part.minStock);
                    return (
                      <TableRow key={part.id}>
                        <TableCell className="font-medium">{part.partNumber}</TableCell>
                        <TableCell>{part.name}</TableCell>
                        <TableCell>{part.brand}</TableCell>
                        <TableCell>{part.category}</TableCell>
                        <TableCell>
                          <div className="text-xs max-w-[200px] truncate">
                            {part.compatibleModels.join(", ")}
                          </div>
                        </TableCell>
                        <TableCell>{part.currentStock}</TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {filteredParts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No parts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Other tab content would be similar but filtered by category */}
        <TabsContent value="toner" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Toner Cartridges</CardTitle>
              <CardDescription>
                Toner cartridges for various printer and copier models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Toner cartridges would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="drum" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Drum Units</CardTitle>
              <CardDescription>
                Drum and imaging units for various machine models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Drum units would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="maintenance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Kits</CardTitle>
              <CardDescription>
                Preventive maintenance kits for various machine models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Maintenance kits would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fuser" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fusers & Fixing Film</CardTitle>
              <CardDescription>
                Fuser assemblies and fixing film for various machine models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Fuser units would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MachineParts;
