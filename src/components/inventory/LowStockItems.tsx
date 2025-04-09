
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample low stock items
const lowStockItems = [
  {
    id: 1,
    name: "Kyocera 2554ci Toner Black",
    quantity: 0,
    status: "Out of Stock"
  },
  {
    id: 2,
    name: "Ricoh MP2014 Drum Unit",
    quantity: 2,
    status: "Low Stock"
  },
  {
    id: 3,
    name: "Xerox 7845 Toner Cyan",
    quantity: 1,
    status: "Low Stock"
  },
  {
    id: 4,
    name: "Canon 2525 Fuser Unit",
    quantity: 1,
    status: "Low Stock"
  },
  {
    id: 5,
    name: "Samsung ProXpress Toner",
    quantity: 0,
    status: "Out of Stock"
  }
];

const LowStockItems = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Low Stock Alerts</CardTitle>
        <CardDescription>
          Items requiring immediate attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockItems.map((item) => (
            <div 
              key={item.id}
              className={`flex items-center justify-between p-2 rounded border ${
                item.quantity === 0 
                  ? "bg-red-50 border-red-100" 
                  : "bg-amber-50 border-amber-100"
              }`}
            >
              <div className="flex items-center gap-2">
                {item.quantity === 0 ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Package className="h-4 w-4 text-amber-500" />
                )}
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className={`text-sm font-medium ${
                    item.quantity === 0 ? "text-red-500" : "text-amber-500"
                  }`}
                >
                  {item.quantity === 0 ? "Out of Stock" : `${item.quantity} left`}
                </div>
                <Button variant="ghost" size="sm">Order</Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm" className="w-full">
            View All Alerts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LowStockItems;
