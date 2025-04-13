
import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import FinanceDashboard from "@/pages/finance/FinanceDashboard";
import DepartmentRevenue from "@/pages/finance/DepartmentRevenue";
import DepartmentExpenses from "@/pages/finance/DepartmentExpenses";
import CashRegister from "@/pages/finance/CashRegister";
import Vendors from "@/pages/inventory/Vendors";
import EngineerInventory from "@/pages/inventory/EngineerInventory";
import Service from "@/pages/Service";
import ServiceCallForm from "@/pages/ServiceCallForm";
import ServiceBilling from "@/pages/ServiceBilling";
import CustomerForm from "@/pages/CustomerForm";
import EngineerDetail from "@/pages/EngineerDetail";
import Customers from "@/pages/Customers";
import AccessDenied from "@/pages/AccessDenied";
import CustomerFollowUps from "@/pages/customers/CustomerFollowUps";
import EngineerPerformanceDashboard from "@/pages/EngineerPerformanceDashboard";
import ServiceInventoryManagement from "@/pages/ServiceInventoryManagement";
import Inventory from "@/pages/Inventory";
import MachineParts from "@/pages/inventory/MachineParts";
import InventoryVendors from "@/pages/inventory/InventoryVendors";
import VendorPerformanceDemo from "@/pages/inventory/VendorPerformanceDemo";
import ProfitReport from "@/pages/inventory/ProfitReport";
import InventoryItems from "@/pages/inventory/InventoryItems";
import InventoryBrands from "@/pages/inventory/InventoryBrands";
import InventoryPurchase from "@/pages/inventory/InventoryPurchase";
import InventoryIssue from "@/pages/inventory/InventoryIssue";
import InventoryWarehouses from "@/pages/inventory/InventoryWarehouses";
import InventoryHistory from "@/pages/inventory/InventoryHistory";
import EngineerForm from "@/pages/EngineerForm";
import AmcTracker from "@/pages/inventory/AmcTracker";
import TelegramAdmin from "@/pages/TelegramAdmin";
import SmartAssistant from "@/pages/SmartAssistant";
// Quotation pages
import Quotations from "@/pages/sales/Quotations";
import QuotationForm from "@/pages/sales/QuotationForm";
import SentQuotations from "@/pages/sales/SentQuotations";
import QuotationProducts from "@/pages/sales/QuotationProducts";
import ContractUpload from "@/pages/sales/ContractUpload";
import PurchaseOrders from "@/pages/sales/PurchaseOrders";
import PurchaseOrderForm from "@/pages/sales/PurchaseOrderForm";
import SentOrders from "@/pages/sales/SentOrders";
import OrderHistory from "@/pages/sales/OrderHistory";
import TaskDashboard from "@/pages/tasks/TaskDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes without layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/access-denied" element={<AccessDenied />} />
      
      {/* Protected routes with layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path="/customers/follow-ups" element={<ProtectedRoute><CustomerFollowUps /></ProtectedRoute>} />
        <Route path="/customer-form" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
        <Route path="/customer-form/:id" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
        
        <Route path="/finance" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
        <Route path="/finance/cash-register" element={<ProtectedRoute><CashRegister /></ProtectedRoute>} />
        <Route path="/finance/revenue" element={<ProtectedRoute><DepartmentRevenue /></ProtectedRoute>} />
        <Route path="/finance/expenses" element={<ProtectedRoute><DepartmentExpenses /></ProtectedRoute>} />

        {/* Inventory Routes */}
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/inventory/items" element={<ProtectedRoute><InventoryItems /></ProtectedRoute>} />
        <Route path="/inventory/vendors" element={<ProtectedRoute><InventoryVendors /></ProtectedRoute>} />
        <Route path="/inventory/engineer-inventory" element={<ProtectedRoute><EngineerInventory /></ProtectedRoute>} />
        <Route path="/inventory/machine-parts" element={<ProtectedRoute><MachineParts /></ProtectedRoute>} />
        <Route path="/inventory/vendor-performance" element={<ProtectedRoute><VendorPerformanceDemo /></ProtectedRoute>} />
        <Route path="/inventory/profit-report" element={<ProtectedRoute><ProfitReport /></ProtectedRoute>} />
        <Route path="/inventory/brands" element={<ProtectedRoute><InventoryBrands /></ProtectedRoute>} />
        <Route path="/inventory/purchase-entry" element={<ProtectedRoute><InventoryPurchase /></ProtectedRoute>} />
        <Route path="/inventory/issue" element={<ProtectedRoute><InventoryIssue /></ProtectedRoute>} />
        <Route path="/inventory/warehouses" element={<ProtectedRoute><InventoryWarehouses /></ProtectedRoute>} />
        <Route path="/inventory/transfers" element={<ProtectedRoute><InventoryHistory /></ProtectedRoute>} />
        <Route path="/inventory/amc-tracker" element={<ProtectedRoute><AmcTracker /></ProtectedRoute>} />
        
        <Route path="/service" element={<ProtectedRoute><Service /></ProtectedRoute>} />
        <Route path="/service-call-form" element={<ProtectedRoute><ServiceCallForm /></ProtectedRoute>} />
        <Route path="/service-billing" element={<ProtectedRoute><ServiceBilling /></ProtectedRoute>} />
        <Route path="/service-inventory" element={<ProtectedRoute><ServiceInventoryManagement /></ProtectedRoute>} />
        <Route path="/engineer/:id" element={<ProtectedRoute><EngineerDetail /></ProtectedRoute>} />
        <Route path="/engineer/new" element={<ProtectedRoute><EngineerForm /></ProtectedRoute>} />
        <Route path="/engineer-performance" element={<ProtectedRoute><EngineerPerformanceDashboard /></ProtectedRoute>} />

        {/* Quotation Routes */}
        <Route path="/quotations" element={<ProtectedRoute><Quotations /></ProtectedRoute>} />
        <Route path="/quotation-form" element={<ProtectedRoute><QuotationForm /></ProtectedRoute>} />
        <Route path="/sent-quotations" element={<ProtectedRoute><SentQuotations /></ProtectedRoute>} />
        <Route path="/quotation-products" element={<ProtectedRoute><QuotationProducts /></ProtectedRoute>} />
        <Route path="/contract-upload" element={<ProtectedRoute><ContractUpload /></ProtectedRoute>} />
        <Route path="/purchase-orders" element={<ProtectedRoute><PurchaseOrders /></ProtectedRoute>} />
        <Route path="/purchase-order-form" element={<ProtectedRoute><PurchaseOrderForm /></ProtectedRoute>} />
        <Route path="/sent-orders" element={<ProtectedRoute><SentOrders /></ProtectedRoute>} />
        <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
        
        {/* Task Routes */}
        <Route path="/tasks" element={<ProtectedRoute><TaskDashboard /></ProtectedRoute>} />
        
        {/* Smart Assistant */}
        <Route path="/smart-assistant" element={<ProtectedRoute><SmartAssistant /></ProtectedRoute>} />

        {/* Telegram Admin */}
        <Route path="/telegram-admin" element={<ProtectedRoute><TelegramAdmin /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
