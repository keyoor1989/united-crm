
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { Warehouse } from "@/types/inventory";

interface WarehouseTableProps {
  warehouses: Warehouse[];
  isLoading: boolean;
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouseId: string) => void;
}

const WarehouseTable = ({ 
  warehouses, 
  isLoading, 
  onEdit, 
  onDelete 
}: WarehouseTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Contact Person</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading warehouses...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : warehouses.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              No warehouses found
            </TableCell>
          </TableRow>
        ) : (
          warehouses.map((warehouse) => (
            <TableRow key={warehouse.id}>
              <TableCell className="font-medium">{warehouse.name}</TableCell>
              <TableCell>{warehouse.code}</TableCell>
              <TableCell>{warehouse.location}</TableCell>
              <TableCell>{warehouse.contactPerson}</TableCell>
              <TableCell>{warehouse.contactPhone}</TableCell>
              <TableCell>
                <Badge variant={warehouse.isActive ? "success" : "secondary"}>
                  {warehouse.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => onEdit(warehouse)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onDelete(warehouse.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default WarehouseTable;
