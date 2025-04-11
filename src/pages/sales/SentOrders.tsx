
import React, { useState } from "react";
import { purchaseOrders } from "@/data/salesData";
import SentOrderHeader from "@/components/sales/sent-orders/SentOrderHeader";
import SentOrderSearch from "@/components/sales/sent-orders/SentOrderSearch";
import SentOrderTable from "@/components/sales/sent-orders/SentOrderTable";

const SentOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter only sent orders
  const filteredOrders = purchaseOrders
    .filter(o => o.status === "Sent")
    .filter(order => 
      order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  return (
    <div className="container mx-auto py-6">
      <SentOrderHeader />
      <SentOrderSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <SentOrderTable orders={filteredOrders} />
    </div>
  );
};

export default SentOrders;
