
import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import TaskEnabledLayout from "@/components/layout/TaskEnabledLayout";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import FinanceDashboard from "@/pages/finance/FinanceDashboard";
import DepartmentRevenue from "@/pages/finance/DepartmentRevenue";
import DepartmentExpenses from "@/pages/finance/DepartmentExpenses";
import CashRegister from "@/pages/finance/CashRegister";
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
import Settings from "@/pages/Settings";
import SmartAssistant from "@/pages/SmartAssistant";
import TelegramAdmin from "@/pages/TelegramAdmin";
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
import InventorySales from "@/pages/inventory/InventorySales";
import CashPurchase from "@/pages/inventory/CashPurchase";
import SalesReports from "@/pages/inventory/SalesReports";
import UserManagement from "@/pages/user-management/UserManagement";
import BranchTransfer from "@/pages/inventory/BranchTransfer";
import NotFound from "@/pages/NotFound";
import InventoryVendors from "@/pages/inventory/InventoryVendors";
import { VendorProvider } from "@/contexts/VendorContext";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/access-denied" element={<AccessDenied />} />
      
      <Route element={<TaskEnabledLayout />}>
        <Route path="/tasks" element={<ProtectedRoute><TaskDashboard /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Route>
      
      <Route element={<Layout />}>
        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path="/customers/follow-ups" element={<ProtectedRoute><CustomerFollowUps /></ProtectedRoute>} />
        <Route path="/customer-form" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
        <Route path="/customer-form/:id" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
        
        <Route path="/finance" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
        <Route path="/finance/cash-register" element={<ProtectedRoute><CashRegister /></ProtectedRoute>} />
        <Route path="/finance/revenue" element={<ProtectedRoute><DepartmentRevenue /></ProtectedRoute>} />
        <Route path="/finance/expenses" element={<ProtectedRoute><DepartmentExpenses /></ProtectedRoute>} />

        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/inventory/items" element={<ProtectedRoute><InventoryItems /></ProtectedRoute>} />
        <Route path="/inventory/brands" element={<ProtectedRoute><InventoryBrands /></ProtectedRoute>} />
        <Route path="/inventory/vendors" element={<ProtectedRoute><VendorProvider><InventoryVendors /></VendorProvider></ProtectedRoute>} />
        <Route path="/inventory/warehouses" element={<ProtectedRoute><InventoryWarehouses /></ProtectedRoute>} />
        <Route path="/inventory/purchase-entry" element={<ProtectedRoute><InventoryPurchase /></ProtectedRoute>} />
        <Route path="/inventory/issue" element={<ProtectedRoute><InventoryIssue /></ProtectedRoute>} />
        <Route path="/inventory/transfers" element={<ProtectedRoute><InventoryHistory /></ProtectedRoute>} />
        <Route path="/inventory/branch-transfer" element={<ProtectedRoute><BranchTransfer /></ProtectedRoute>} />
        <Route path="/inventory/amc-tracker" element={<ProtectedRoute><AmcTracker /></ProtectedRoute>} />
        <Route path="/inventory/cash-purchase" element={<ProtectedRoute><CashPurchase /></ProtectedRoute>} />
        <Route path="/inventory/sales" element={<ProtectedRoute><InventorySales /></ProtectedRoute>} />
        <Route path="/inventory/sales-reports" element={<ProtectedRoute><SalesReports /></ProtectedRoute>} />
        <Route path="/inventory/vendor-performance" element={<ProtectedRoute><VendorProvider><VendorPerformanceDemo /></VendorProvider></ProtectedRoute>} />
        <Route path="/inventory/profit-report" element={<ProtectedRoute><ProfitReport /></ProtectedRoute>} />
        
        <Route path="/service" element={<ProtectedRoute><Service /></ProtectedRoute>} />
        <Route path="/service-call-form" element={<ProtectedRoute><ServiceCallForm /></ProtectedRoute>} />
        <Route path="/service-billing" element={<ProtectedRoute><ServiceBilling /></ProtectedRoute>} />
        <Route path="/service-inventory" element={<ProtectedRoute><ServiceInventoryManagement /></ProtectedRoute>} />
        <Route path="/engineer/:id" element={<ProtectedRoute><EngineerDetail /></ProtectedRoute>} />
        <Route path="/engineer/new" element={<ProtectedRoute><EngineerForm /></ProtectedRoute>} />
        <Route path="/engineer-performance" element={<ProtectedRoute><EngineerPerformanceDashboard /></ProtectedRoute>} />

        <Route path="/quotations" element={<ProtectedRoute><Quotations /></ProtectedRoute>} />
        <Route path="/quotation-form" element={<ProtectedRoute><QuotationForm /></ProtectedRoute>} />
        <Route path="/sent-quotations" element={<ProtectedRoute><SentQuotations /></ProtectedRoute>} />
        <Route path="/quotation-products" element={<ProtectedRoute><QuotationProducts /></ProtectedRoute>} />
        <Route path="/contract-upload" element={<ProtectedRoute><ContractUpload /></ProtectedRoute>} />
        <Route path="/purchase-orders" element={<ProtectedRoute><PurchaseOrders /></ProtectedRoute>} />
        <Route path="/purchase-order-form" element={<ProtectedRoute><PurchaseOrderForm /></ProtectedRoute>} />
        <Route path="/sent-orders" element={<ProtectedRoute><SentOrders /></ProtectedRoute>} />
        <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
        
        <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        
        <Route path="/smart-assistant" element={<ProtectedRoute><SmartAssistant /></ProtectedRoute>} />

        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/telegram-admin" element={<ProtectedRoute><TelegramAdmin /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
