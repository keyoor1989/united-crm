
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Edit, Trash2 } from "lucide-react";

// Sample inventory data
const inventoryItems = [
  {
    id: 1,
    name: "Kyocera 2554ci Toner Black",
    sku: "K-TN2554-BK",
    category: "Toner",
    quantity: 0,
    location: "Indore (HQ)",
    price: 4500,
    status: "Out of Stock"
  },
  {
    id: 2,
    name: "Ricoh MP2014 Drum Unit",
    sku: "R-DRM-MP2014",
    category: "Drum",
    quantity: 2,
    location: "Indore (HQ)",
    price: 3200,
    status: "Low Stock"
  },
  {
    id: 3,
    name: "Xerox 7845 Toner Cyan",
    sku: "X-TN7845-CY",
    category: "Toner",
    quantity: 1,
    location: "Bhopal Office",
    price: 5100,
    status: "Low Stock"
  },
  {
    id: 4,
    name: "Canon 2525 Drum Unit",
    sku: "C-DRM-2525",
    category: "Drum",
    quantity: 4,
    location: "Indore (HQ)",
    price: 4200,
    status: "In Stock"
  },
  {
    id: 5,
    name: "HP M428 Toner",
    sku: "HP-TN-M428",
    category: "Toner",
    quantity: 7,
    location: "Jabalpur Office",
    price: 2800,
    status: "In Stock"
  },
  {
    id: 6,
    name: "Sharp MX3070 Toner Black",
    sku: "SH-TN3070-BK",
    category: "Toner",
    quantity: 3,
    location: "Indore (HQ)",
    price: 5500,
    status: "In Stock"
  },
];

const InventoryTable = () => {
  // Function to get status badge color
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Out of Stock":
        return "destructive";
      case "Low Stock":
        return "warning";
      case "In Stock":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableCaption>A list of your inventory items.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Product Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventoryItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                {item.name}
              </TableCell>
              <TableCell>{item.sku}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.location}</TableCell>
              <TableCell className="text-right">₹{item.price.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(item.status) as any}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryTable;
