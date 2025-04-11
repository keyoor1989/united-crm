
import React, { useState } from "react";
import { purchaseOrders } from "@/data/salesData";
import { PurchaseOrderStatus } from "@/types/sales";
import PurchaseOrderHeader from "@/components/sales/purchase-orders/PurchaseOrderHeader";
import PurchaseOrderFilters from "@/components/sales/purchase-orders/PurchaseOrderFilters";
import PurchaseOrderTable from "@/components/sales/purchase-orders/PurchaseOrderTable";

const PurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | "All">("All");
  
  // Filter purchase orders based on search term and status
  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = 
      order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="container mx-auto py-6">
      <PurchaseOrderHeader />
      <PurchaseOrderFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <PurchaseOrderTable orders={filteredOrders} />
    </div>
  );
};

export default PurchaseOrders;
