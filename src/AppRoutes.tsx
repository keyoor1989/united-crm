
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import CommandCopilot from "@/pages/CommandCopilot";
import NotFound from "@/pages/NotFound";

// Import our newly created components
import SentQuotations from "@/pages/sales/SentQuotations";
import QuotationProducts from "@/pages/sales/QuotationProducts";
import ContractUpload from "@/pages/sales/ContractUpload";
import SentOrders from "@/pages/sales/SentOrders";
import OrderHistory from "@/pages/sales/OrderHistory";

// Import Finance pages
import FinanceDashboard from "@/pages/finance/FinanceDashboard";
import CashRegister from "@/pages/finance/CashRegister";
import DepartmentRevenueNew from "@/pages/finance/DepartmentRevenueNew";
import DepartmentExpenses from "@/pages/finance/DepartmentExpenses";
import CustomerPayments from "@/pages/finance/CustomerPayments";
import OutstandingReceivables from "@/pages/finance/OutstandingReceivables";

// Import Reports
import Reports from "@/pages/Reports";
import MachineRentalReport from "@/pages/reports/MachineRentalReport";
import EngineerServiceReport from "@/pages/reports/EngineerServiceReport";
import CustomerFollowUpReport from "@/pages/reports/CustomerFollowUpReport";
import BranchProfitReport from "@/pages/reports/BranchProfitReport";

// Import Task Management
import TaskDashboard from "@/pages/tasks/TaskDashboard";

// Import Auth related components
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Login from "@/pages/Login";
import AccessDenied from "@/pages/AccessDenied";
import UserManagement from "@/pages/user-management/UserManagement";

const AppRoutes = () => (
  <AuthProvider>
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/access-denied" element={<AccessDenied />} />
      
      {/* Protected routes */}
      <Route 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customer-form" element={<CustomerForm />} />
        
        {/* Finance Routes */}
        <Route path="/finance" element={<FinanceDashboard />} />
        <Route path="/finance/cash-register" element={<CashRegister />} />
        <Route path="/finance/revenue" element={<DepartmentRevenueNew />} />
        <Route path="/finance/expenses" element={<DepartmentExpenses />} />
        <Route path="/finance/payments" element={<CustomerPayments />} />
        <Route path="/finance/receivables" element={<OutstandingReceivables />} />
        
        {/* Reports Routes */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/machine-rental" element={<MachineRentalReport />} />
        <Route path="/reports/engineer-service" element={<EngineerServiceReport />} />
        <Route path="/reports/customer-followup" element={<CustomerFollowUpReport />} />
        <Route path="/reports/branch-profit" element={<BranchProfitReport />} />
        
        {/* Service Routes */}
        <Route path="/service" element={<Service />} />
        <Route path="/service-call-form" element={<ServiceCallForm />} />
        <Route path="/engineer/:id" element={<EngineerDetail />} />
        <Route path="/engineer-performance" element={<EngineerPerformanceDashboard />} />
        
        {/* Task Management Routes */}
        <Route path="/tasks" element={<TaskDashboard />} />
        
        {/* Inventory Routes */}
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
        
        {/* Command Copilot (replacing the old chat assistants) */}
        <Route path="/command-copilot" element={<CommandCopilot />} />
        
        {/* Redirect old chat pages to the new Command Copilot */}
        <Route path="/chat" element={<Navigate to="/command-copilot" replace />} />
        <Route path="/chat-assistant" element={<Navigate to="/command-copilot" replace />} />
        
        {/* User Management */}
        <Route path="/user-management" element={<UserManagement />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Route>
      
      {/* Redirect root to login if not authenticated */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </AuthProvider>
);

export default AppRoutes;
