import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import CustomerForm from "@/pages/CustomerForm";
import Service from "@/pages/Service";
import ServiceCallForm from "@/pages/ServiceCallForm";
import EngineerDetail from "@/pages/EngineerDetail";
import EngineerPerformanceDashboard from "@/pages/EngineerPerformanceDashboard";
import Inventory from "@/pages/Inventory";
import InventoryBrands from "@/pages/inventory/InventoryBrands";
import InventoryItems from "@/pages/inventory/InventoryItems";
import InventoryPurchase from "@/pages/inventory/InventoryPurchase";
import InventoryIssue from "@/pages/inventory/InventoryIssue";
import InventoryHistory from "@/pages/inventory/InventoryHistory";
import InventoryAlerts from "@/pages/inventory/InventoryAlerts";
import VendorPerformance from "@/pages/inventory/VendorPerformance";
import InventoryTransfer from "@/pages/inventory/InventoryTransfer";
import BranchTransfer from "@/pages/inventory/BranchTransfer";
import InventoryReturns from "@/pages/inventory/InventoryReturns";
import InventoryWarehouses from "@/pages/inventory/InventoryWarehouses";
import EngineerInventory from "@/pages/inventory/EngineerInventory";
import MachineParts from "@/pages/inventory/MachineParts";
import ProfitReport from "@/pages/inventory/ProfitReport";
import AmcTracker from "@/pages/inventory/AmcTracker";
import VendorPerformanceDemo from "@/pages/inventory/VendorPerformanceDemo";
import InventorySales from "@/pages/inventory/InventorySales";
import Quotations from "@/pages/sales/Quotations";
import QuotationForm from "@/pages/sales/QuotationForm";
import PurchaseOrders from "@/pages/sales/PurchaseOrders";
import PurchaseOrderForm from "@/pages/sales/PurchaseOrderForm";
import ProductCatalog from "@/pages/sales/ProductCatalog";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/NotFound";

// Import our newly created components
import SentQuotations from "@/pages/sales/SentQuotations";
import QuotationProducts from "@/pages/sales/QuotationProducts";
import ContractUpload from "@/pages/sales/ContractUpload";
import SentOrders from "@/pages/sales/SentOrders";
import OrderHistory from "@/pages/sales/OrderHistory";

const AppRoutes = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customer-form" element={<CustomerForm />} />
      <Route path="/service" element={<Service />} />
      <Route path="/service-call-form" element={<ServiceCallForm />} />
      <Route path="/engineer/:id" element={<EngineerDetail />} />
      <Route path="/engineer-performance" element={<EngineerPerformanceDashboard />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/inventory/brands" element={<InventoryBrands />} />
      <Route path="/inventory/items" element={<InventoryItems />} />
      <Route path="/inventory/vendors" element={<VendorPerformance />} />
      <Route path="/inventory/purchase" element={<InventoryPurchase />} />
      <Route path="/inventory/sales" element={<InventorySales />} />
      <Route path="/inventory/issue" element={<InventoryIssue />} />
      <Route path="/inventory/transfer" element={<InventoryTransfer />} />
      <Route path="/inventory/branch-transfer" element={<BranchTransfer />} />
      <Route path="/inventory/returns" element={<InventoryReturns />} />
      <Route path="/inventory/warehouses" element={<InventoryWarehouses />} />
      <Route path="/inventory/engineer-inventory" element={<EngineerInventory />} />
      <Route path="/inventory/machine-parts" element={<MachineParts />} />
      <Route path="/inventory/profit-report" element={<ProfitReport />} />
      <Route path="/inventory/amc-tracker" element={<AmcTracker />} />
      <Route path="/inventory/vendor-performance" element={<VendorPerformance />} />
      <Route path="/inventory/vendor-performance-metrics" element={<VendorPerformanceDemo />} />
      <Route path="/inventory/history" element={<InventoryHistory />} />
      <Route path="/inventory/alerts" element={<InventoryAlerts />} />
      
      {/* Quotation routes */}
      <Route path="/quotations" element={<Quotations />} />
      <Route path="/quotation-form" element={<QuotationForm />} />
      <Route path="/quotation-form/:id" element={<QuotationForm />} />
      <Route path="/sent-quotations" element={<SentQuotations />} />
      <Route path="/quotation-products" element={<QuotationProducts />} />
      <Route path="/contract-upload" element={<ContractUpload />} />
      
      {/* Purchase order routes */}
      <Route path="/purchase-orders" element={<PurchaseOrders />} />
      <Route path="/purchase-order-form" element={<PurchaseOrderForm />} />
      <Route path="/purchase-order-form/:id" element={<PurchaseOrderForm />} />
      <Route path="/sent-orders" element={<SentOrders />} />
      <Route path="/order-history" element={<OrderHistory />} />
      
      <Route path="/product-catalog" element={<ProductCatalog />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default AppRoutes;
