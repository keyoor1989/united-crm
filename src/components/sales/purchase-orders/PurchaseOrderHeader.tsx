
import React from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PurchaseOrderHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
        <p className="text-muted-foreground">
          Manage your purchase orders with vendors.
        </p>
      </div>
      <Button 
        onClick={() => navigate("/purchase-order-form")}
        className="flex items-center gap-1"
      >
        <PlusCircle className="h-4 w-4" />
        New Purchase Order
      </Button>
    </div>
  );
};

export default PurchaseOrderHeader;
