
import { useState, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { SalesItem } from "../SalesTable";

export function useSalesManagement(initialSalesData: SalesItem[]) {
  const [salesData, setSalesData] = useState<SalesItem[]>(initialSalesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  
  // Filter sales data based on search and filters
  const filteredSalesData = salesData.filter((sale) => {
    // Search query filter
    const matchesSearch =
      sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Payment status filter
    const matchesPayment =
      paymentFilter === "all" ||
      sale.paymentStatus.toLowerCase() === paymentFilter.toLowerCase();

    // Sale status filter
    const matchesStatus =
      statusFilter === "all" ||
      sale.status.toLowerCase() === statusFilter.toLowerCase();

    // Customer type filter
    const matchesCustomerType =
      customerTypeFilter === "all" ||
      sale.customerType.toLowerCase() === customerTypeFilter.toLowerCase();

    return matchesSearch && matchesPayment && matchesStatus && matchesCustomerType;
  });
  
  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setPaymentFilter("all");
    setStatusFilter("all");
    setCustomerTypeFilter("all");
  }, []);
  
  // Add new sale
  const addSale = useCallback((newSale: SalesItem) => {
    setSalesData((prev) => [newSale, ...prev]);
    toast.success("Sale recorded successfully");
  }, []);
  
  // Generate bill for a sale
  const generateBill = useCallback((sale: SalesItem) => {
    setSalesData((prev) =>
      prev.map((item) =>
        item.id === sale.id
          ? {
              ...item,
              billGenerated: true,
              invoiceNumber: `INV-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 100)}`,
            }
          : item
      )
    );
    toast.success(`Bill generated for ${sale.customer}`);
  }, []);
  
  // Record payment for a sale
  const recordPayment = useCallback((saleId: string, paymentData: any) => {
    setSalesData((prev) =>
      prev.map((item) =>
        item.id === saleId
          ? {
              ...item,
              paymentStatus: "Paid",
              billGenerated: true,
              invoiceNumber: paymentData.invoiceNumber,
            }
          : item
      )
    );
    toast.success(`Payment recorded successfully`);
  }, []);
  
  // Export sales data
  const exportSalesData = useCallback(() => {
    const dataStr = JSON.stringify(filteredSalesData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `sales-data-${format(new Date(), "yyyy-MM-dd")}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    
    toast.success("Sales data exported successfully");
  }, [filteredSalesData]);
  
  return {
    salesData,
    filteredSalesData,
    searchQuery,
    setSearchQuery,
    paymentFilter,
    setPaymentFilter,
    statusFilter,
    setStatusFilter,
    customerTypeFilter,
    setCustomerTypeFilter,
    resetFilters,
    addSale,
    generateBill,
    recordPayment,
    exportSalesData,
  };
}
