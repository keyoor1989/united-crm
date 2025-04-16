
import { useState } from "react";
import { SalesItem } from "../SalesTable";
import { toast } from "sonner";

export const useSalesManagement = (initialData: SalesItem[]) => {
  const [salesData, setSalesData] = useState<SalesItem[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("All");

  // Filter data based on search query and filters
  const filteredSalesData = salesData.filter((item) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase());

    // Payment status filter
    const matchesPayment =
      paymentFilter === "All" ||
      item.paymentStatus.toLowerCase() === paymentFilter.toLowerCase();

    // Sale status filter
    const matchesStatus =
      statusFilter === "All" ||
      item.status.toLowerCase() === statusFilter.toLowerCase();

    // Customer type filter
    const matchesCustomerType =
      customerTypeFilter === "All" ||
      item.customerType.toLowerCase() === customerTypeFilter.toLowerCase();

    return matchesSearch && matchesPayment && matchesStatus && matchesCustomerType;
  });

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setPaymentFilter("All");
    setStatusFilter("All");
    setCustomerTypeFilter("All");
  };

  // Add a new sale
  const addSale = (sale: SalesItem) => {
    setSalesData([sale, ...salesData]);
    toast.success(`Sale recorded for ${sale.customer}`);
  };

  // Generate bill for a sale
  const generateBill = (sale: SalesItem) => {
    const updatedSalesData = salesData.map((item) => {
      if (item.id === sale.id) {
        const updatedItem = {
          ...item,
          billGenerated: true,
          invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
            Math.random() * 100
          )}`,
        };
        return updatedItem;
      }
      return item;
    });

    setSalesData(updatedSalesData);
    toast.success(`Bill generated for ${sale.customer}`);
  };

  // Record payment for a sale
  const recordPayment = (saleId: string, paymentData: any) => {
    const updatedSalesData = salesData.map((item) => {
      if (item.id === saleId) {
        return {
          ...item,
          paymentStatus: "Paid",
          paymentMethod: paymentData.paymentMethod,
          // Update other payment fields if needed
        };
      }
      return item;
    });

    setSalesData(updatedSalesData);
    toast.success(`Payment recorded successfully`);
  };

  // Export sales data to CSV
  const exportSalesData = () => {
    // This would normally generate and download a CSV file
    // For this demo, we'll just show a success message
    toast.success(`Exported ${filteredSalesData.length} sales records`);
  };

  return {
    salesData,
    setSalesData,
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
};
