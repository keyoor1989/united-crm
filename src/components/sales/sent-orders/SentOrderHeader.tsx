
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SentOrderHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sent Orders</h1>
        <p className="text-muted-foreground">
          Track and manage purchase orders that have been sent to vendors
        </p>
      </div>
      <Button 
        onClick={() => navigate("/purchase-order-form")}
        variant="outline"
      >
        New Purchase Order
      </Button>
    </div>
  );
};

export default SentOrderHeader;
