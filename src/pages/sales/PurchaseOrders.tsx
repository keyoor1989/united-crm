import React, { useState, useEffect } from "react";
import { PurchaseOrderStatus } from "@/types/sales";
import PurchaseOrderHeader from "@/components/sales/purchase-orders/PurchaseOrderHeader";
import PurchaseOrderFilters from "@/components/sales/purchase-orders/PurchaseOrderFilters";
import PurchaseOrderTable from "@/components/sales/purchase-orders/PurchaseOrderTable";
// Fix the import for fetchPurchaseOrders
import { fetchPurchaseOrders } from '@/services/purchaseOrderService';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const PurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | "All">("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadPurchaseOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchPurchaseOrders();
        setOrders(data);
      } catch (error) {
        console.error("Error loading purchase orders:", error);
        toast({
          title: "Error",
          description: "Failed to load purchase orders. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadPurchaseOrders();
  }, [toast]);
  
  // Filter purchase orders based on search term and status
  const filteredOrders = orders.filter(order => {
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
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading purchase orders...</span>
        </div>
      ) : (
        <PurchaseOrderTable orders={filteredOrders} />
      )}
    </div>
  );
};

export default PurchaseOrders;
