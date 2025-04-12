
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileDown, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for AMC consumables
const mockConsumables = [
  { 
    id: "1", 
    name: "Toner Cartridge", 
    model: "HP LaserJet Pro", 
    stockLevel: 15, 
    minimumStock: 5, 
    lastIssued: "2025-02-15", 
    status: "In Stock" 
  },
  { 
    id: "2", 
    name: "Drum Unit", 
    model: "Brother HL-Series", 
    stockLevel: 3, 
    minimumStock: 5, 
    lastIssued: "2025-03-21", 
    status: "Low Stock" 
  },
  { 
    id: "3", 
    name: "Fuser Assembly", 
    model: "Xerox WorkCentre", 
    stockLevel: 8, 
    minimumStock: 3, 
    lastIssued: "2025-01-10", 
    status: "In Stock" 
  },
  { 
    id: "4", 
    name: "Maintenance Kit", 
    model: "Canon ImageRunner", 
    stockLevel: 0, 
    minimumStock: 2, 
    lastIssued: "2025-02-28", 
    status: "Out of Stock" 
  },
  { 
    id: "5", 
    name: "Ink Cartridge (Black)", 
    model: "Epson EcoTank", 
    stockLevel: 12, 
    minimumStock: 4, 
    lastIssued: "2025-03-15", 
    status: "In Stock" 
  }
];

const AmcConsumables = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredConsumables = mockConsumables.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && item.status === statusFilter;
  });

  const handleAddConsumable = () => {
    // This would open a dialog to add a new consumable
    console.log("Add new consumable");
  };

  const handleExport = () => {
    // This would handle exporting the data
    console.log("Export data");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AMC Consumables</h1>
          <p className="text-muted-foreground">
            Manage and track consumables for Annual Maintenance Contracts
          </p>
        </div>
        <Button onClick={handleAddConsumable} className="gap-1 bg-brand-500 hover:bg-brand-600">
          <Plus className="h-4 w-4" />
          Add Consumable
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search consumables..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport}>
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-center">Stock Level</TableHead>
                <TableHead className="text-center">Minimum Stock</TableHead>
                <TableHead>Last Issued</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsumables.length > 0 ? (
                filteredConsumables.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.model}</TableCell>
                    <TableCell className="text-center">{item.stockLevel}</TableCell>
                    <TableCell className="text-center">{item.minimumStock}</TableCell>
                    <TableCell>{item.lastIssued}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={
                          item.status === "In Stock" 
                            ? "success" 
                            : item.status === "Low Stock" 
                              ? "warning" 
                              : "destructive"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No consumables found matching your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AmcConsumables;
