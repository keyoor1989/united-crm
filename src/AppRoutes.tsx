
import React from "react";
import { Routes, Route } from "react-router-dom";
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
import InventoryVendors from "@/pages/inventory/InventoryVendors";
import InventoryTransfer from "@/pages/inventory/InventoryTransfer";
import InventoryReturns from "@/pages/inventory/InventoryReturns";
import EngineerInventory from "@/pages/inventory/EngineerInventory";
import MachineParts from "@/pages/inventory/MachineParts";
import ProfitReport from "@/pages/inventory/ProfitReport";
import AmcTracker from "@/pages/inventory/AmcTracker";
import VendorPerformance from "@/pages/inventory/VendorPerformance";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/NotFound";

const AppRoutes = () => (
  <Routes>
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
    <Route path="/inventory/vendors" element={<InventoryVendors />} />
    <Route path="/inventory/purchase" element={<InventoryPurchase />} />
    <Route path="/inventory/issue" element={<InventoryIssue />} />
    <Route path="/inventory/transfer" element={<InventoryTransfer />} />
    <Route path="/inventory/returns" element={<InventoryReturns />} />
    <Route path="/inventory/engineer-inventory" element={<EngineerInventory />} />
    <Route path="/inventory/machine-parts" element={<MachineParts />} />
    <Route path="/inventory/profit-report" element={<ProfitReport />} />
    <Route path="/inventory/amc-tracker" element={<AmcTracker />} />
    <Route path="/inventory/vendor-performance" element={<VendorPerformance />} />
    <Route path="/inventory/history" element={<InventoryHistory />} />
    <Route path="/inventory/alerts" element={<InventoryAlerts />} />
    <Route path="/chat" element={<Chat />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
