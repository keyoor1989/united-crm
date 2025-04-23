
import { useState, useEffect, useCallback } from "react";
import { SalesItem } from "../SalesTable";
import { toast } from "sonner";
import { 
  fetchSales, 
  addSale, 
  generateBill as generateBillService, 
  recordPayment as recordPaymentService,
  getCreditSales,
  updateShipmentDetails as updateShipmentDetailsService 
} from "@/services/salesService";

export const useSalesManagement = (initialData?: SalesItem[]) => {
  const [salesData, setSalesData] = useState<SalesItem[]>(initialData || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<Error | null>(null);

  // Load sales data from the database - using useCallback to prevent recreation on every render
  const loadSalesData = useCallback(async (isCreditSalesOnly = false) => {
    setLoading(true);
    setLoadingError(null);
    try {
      const data = isCreditSalesOnly 
        ? await getCreditSales() 
        : await fetchSales();
      setSalesData(data);
    } catch (error) {
      console.error("Error loading sales data:", error);
      toast.error("Failed to load sales data");
      setLoadingError(error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount if no initial data provided
  useEffect(() => {
    if (!initialData) {
      loadSalesData();
    } else {
      setLoading(false);
    }
  }, [initialData, loadSalesData]);

  // Filter data based on search query and filters
  const filteredSalesData = salesData.filter((item) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.itemName && item.itemName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.createdBy && item.createdBy.toLowerCase().includes(searchQuery.toLowerCase()));

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
  const addNewSale = async (sale: SalesItem): Promise<string | null> => {
    try {
      // Get the current user or default to Admin
      const currentUser = "Admin"; // This would come from your auth context
      
      // Convert SalesItem to the format expected by the service
      const saleRecord = {
        date: new Date().toISOString(),
        customer_name: sale.customer,
        customer_type: sale.customerType,
        status: sale.status,
        payment_status: sale.paymentStatus,
        payment_method: sale.paymentMethod,
        invoice_number: sale.invoiceNumber,
        bill_generated: sale.billGenerated,
        subtotal: sale.total, // For simplicity, assuming total is subtotal
        tax_amount: 0, // To be implemented
        total_amount: sale.total,
        created_by: currentUser, // Add the current user
        shipment_method: sale.shipmentMethod,
        shipment_details: sale.shipmentDetails
      };

      const saleItem = {
        item_name: sale.itemName,
        quantity: sale.quantity,
        unit_price: sale.unitPrice,
        total: sale.total
      };

      const saleId = await addSale(saleRecord, [saleItem]);
      
      // Reload the sales data to include the new sale, but don't cause infinite loops
      if (saleId) {
        // Instead of calling loadSalesData directly which could cause rerender loops
        // Just add the new sale to the salesData state
        const newSale = {
          ...sale,
          id: saleId,
          date: new Date().toISOString()
        };
        setSalesData(prevSales => [...prevSales, newSale]);
      }
      
      return saleId;
    } catch (error) {
      toast.error("Failed to add sale: " + (error as Error).message);
      return null;
    }
  };

  // Generate bill for a sale
  const generateBill = async (sale: SalesItem): Promise<boolean> => {
    if (!sale.id) {
      toast.error("Sale ID is missing");
      return false;
    }

    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
      Math.random() * 100
    )}`;

    const success = await generateBillService(sale.id, invoiceNumber);
    if (success) {
      // Update the local state with the new bill status
      const updatedSalesData = salesData.map((item) => {
        if (item.id === sale.id) {
          return {
            ...item,
            billGenerated: true,
            invoiceNumber
          };
        }
        return item;
      });
      
      setSalesData(updatedSalesData);
    }
    return success;
  };

  // Record payment for a sale
  const recordPayment = async (saleId: string, paymentData: any): Promise<boolean> => {
    const payment = {
      sale_id: saleId,
      payment_method: paymentData.paymentMethod,
      amount: paymentData.amount,
      reference_number: paymentData.referenceNumber,
      notes: paymentData.notes
    };

    const success = await recordPaymentService(payment);
    if (success) {
      // Update the local state directly instead of calling loadSalesData
      setSalesData(prev => prev.map(item => {
        if (item.id === saleId) {
          return {
            ...item,
            paymentStatus: 'Paid'
          };
        }
        return item;
      }));
      return true;
    }
    return false;
  };

  // Update shipment details
  const updateShipmentDetails = async (saleId: string, shipmentData: any): Promise<boolean> => {
    const success = await updateShipmentDetailsService(saleId, shipmentData);
    if (success) {
      // Update local state instead of reloading everything
      setSalesData(prev => prev.map(item => {
        if (item.id === saleId) {
          return {
            ...item,
            shipmentMethod: shipmentData.shipment_method,
            shipmentDetails: shipmentData
          };
        }
        return item;
      }));
      return true;
    }
    return false;
  };

  // Export sales data to CSV
  const exportSalesData = () => {
    // Create CSV content
    const headers = ["Date", "Customer", "Type", "Item", "Quantity", "Unit Price", "Total", "Status", "Payment Status", "Invoice", "Created By", "Shipment"];
    const rows = filteredSalesData.map(sale => [
      new Date(sale.date).toLocaleDateString(),
      sale.customer,
      sale.customerType,
      sale.itemName,
      sale.quantity,
      sale.unitPrice,
      sale.total,
      sale.status,
      sale.paymentStatus,
      sale.invoiceNumber || "",
      sale.createdBy || "Admin",
      sale.shipmentMethod || "Not Shipped"
    ]);
    
    // Convert to CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredSalesData.length} sales records`);
  };

  return {
    salesData,
    setSalesData,
    filteredSalesData,
    loading,
    loadingError,
    searchQuery,
    setSearchQuery,
    paymentFilter,
    setPaymentFilter,
    statusFilter,
    setStatusFilter,
    customerTypeFilter,
    setCustomerTypeFilter,
    resetFilters,
    addSale: addNewSale,
    generateBill,
    recordPayment,
    updateShipmentDetails,
    exportSalesData,
    loadSalesData
  };
};
