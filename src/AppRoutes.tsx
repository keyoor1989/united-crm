
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import TaskEnabledLayout from "@/components/layout/TaskEnabledLayout";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AccessDenied from "@/pages/AccessDenied";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CustomerForm from "@/pages/CustomerForm";
import Customers from "@/pages/Customers";
import Dashboard from "@/pages/Dashboard";
import TaskDashboard from "@/pages/tasks/TaskDashboard";
import CustomerFollowUps from "@/pages/customers/CustomerFollowUps";
import Service from "@/pages/Service";
import EngineerPerformanceDashboard from "@/pages/EngineerPerformanceDashboard";
import Inventory from "@/pages/Inventory";
import Reports from "@/pages/Reports";
import SmartAssistant from "@/pages/SmartAssistant";
import TelegramAdmin from "@/pages/TelegramAdmin";
import Settings from "@/pages/Settings";
import Quotations from "@/pages/sales/Quotations";
import QuotationForm from "@/pages/sales/QuotationForm";
import PurchaseOrders from "@/pages/sales/PurchaseOrders";
import SentOrders from "@/pages/sales/SentOrders";
import SentQuotations from "@/pages/sales/SentQuotations";
import OrderHistory from "@/pages/sales/OrderHistory";
import QuotationProducts from "@/pages/sales/QuotationProducts";
import ContractUpload from "@/pages/sales/ContractUpload";
import FinanceDashboard from "@/pages/finance/FinanceDashboard";
import ServiceBilling from "@/pages/ServiceBilling";
import ServiceInventoryManagement from "@/pages/ServiceInventoryManagement";
import RentalMachines from "@/pages/service/RentalMachines";
import UserManagement from "@/pages/user-management/UserManagement";
import EngineerDetail from "@/pages/EngineerDetail";
import EngineerForm from "@/pages/EngineerForm";
import ServiceCallForm from "@/pages/ServiceCallForm";
import Chat from "@/pages/Chat";
import ChatAssistant from "@/pages/ChatAssistant";
import CashRegister from "@/pages/finance/CashRegister";
import CustomerPayments from "@/pages/finance/CustomerPayments";
import DepartmentExpenses from "@/pages/finance/DepartmentExpenses";
import DepartmentRevenue from "@/pages/finance/DepartmentRevenue";
import DepartmentRevenueNew from "@/pages/finance/DepartmentRevenueNew";
import OutstandingReceivables from "@/pages/finance/OutstandingReceivables";
import PendingReceivables from "@/pages/finance/PendingReceivables";
import InventoryAmcTracker from "@/pages/inventory/AmcTracker";
import InventoryBranchTransfer from "@/pages/inventory/BranchTransfer";
import InventoryCashPurchase from "@/pages/inventory/CashPurchase";
import InventoryAlerts from "@/pages/inventory/InventoryAlerts";
import InventoryBrands from "@/pages/inventory/InventoryBrands";
import InventoryHistory from "@/pages/inventory/InventoryHistory";
import InventoryIssue from "@/pages/inventory/InventoryIssue";
import InventoryItems from "@/pages/inventory/InventoryItems";
import InventoryPurchase from "@/pages/inventory/InventoryPurchase";
import InventoryReturns from "@/pages/inventory/InventoryReturns";
import InventorySales from "@/pages/inventory/InventorySales";
import InventoryTransfer from "@/pages/inventory/InventoryTransfer";
import InventoryVendors from "@/pages/inventory/InventoryVendors";
import InventoryWarehouses from "@/pages/inventory/InventoryWarehouses";
import IssueInventory from "@/pages/inventory/IssueInventory";
import ProfitReport from "@/pages/inventory/ProfitReport";
import SalesReports from "@/pages/inventory/SalesReports";
import UnifiedPurchase from "@/pages/inventory/UnifiedPurchase";
import VendorPerformance from "@/pages/inventory/VendorPerformance";
import VendorPerformanceDemo from "@/pages/inventory/VendorPerformanceDemo";
import WarehouseTransfer from "@/pages/inventory/WarehouseTransfer";
import LocationBhopal from "@/pages/locations/LocationBhopal";
import LocationIndore from "@/pages/locations/LocationIndore";
import LocationJabalpur from "@/pages/locations/LocationJabalpur";
import BranchProfitReport from "@/pages/reports/BranchProfitReport";
import CustomerFollowUpReport from "@/pages/reports/CustomerFollowUpReport";
import EngineerServiceReport from "@/pages/reports/EngineerServiceReport";
import MachineRentalReport from "@/pages/reports/MachineRentalReport";
import ProductCatalog from "@/pages/sales/ProductCatalog";
import PurchaseOrderForm from "@/pages/sales/PurchaseOrderForm";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Protected Routes with Layout and Tasks */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <TaskEnabledLayout>
              <Index />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="dashboard"
          element={
            <TaskEnabledLayout>
              <Dashboard />
            </TaskEnabledLayout>
          }
        />
        
        {/* Customer Routes */}
        <Route
          path="customers"
          element={
            <TaskEnabledLayout>
              <Customers />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="customer/:id?"
          element={
            <TaskEnabledLayout>
              <CustomerForm />
            </TaskEnabledLayout>
          }
        />
        {/* Add a redirect from customer-form to customer */}
        <Route
          path="customer-form"
          element={<Navigate to="/customer" replace />}
        />
        {/* Add a route to handle customer-form with ID parameter */}
        <Route
          path="customer-form/:id"
          element={<Navigate to={window.location.pathname.replace('customer-form', 'customer')} replace />}
        />
        <Route
          path="customers/follow-ups"
          element={
            <TaskEnabledLayout>
              <CustomerFollowUps />
            </TaskEnabledLayout>
          }
        />
        
        {/* Task Routes */}
        <Route
          path="tasks"
          element={
            <TaskEnabledLayout>
              <TaskDashboard />
            </TaskEnabledLayout>
          }
        />
        
        {/* Service Routes */}
        <Route
          path="service"
          element={
            <TaskEnabledLayout>
              <Service />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="engineer-performance"
          element={
            <TaskEnabledLayout>
              <EngineerPerformanceDashboard />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="service-billing"
          element={
            <TaskEnabledLayout>
              <ServiceBilling />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="service-inventory"
          element={
            <TaskEnabledLayout>
              <ServiceInventoryManagement />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="rental-machines"
          element={
            <TaskEnabledLayout>
              <RentalMachines />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="engineer/:id"
          element={
            <TaskEnabledLayout>
              <EngineerDetail />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="engineer-form/:id?"
          element={
            <TaskEnabledLayout>
              <EngineerForm />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="service-call-form/:id?"
          element={
            <TaskEnabledLayout>
              <ServiceCallForm />
            </TaskEnabledLayout>
          }
        />
        
        {/* Inventory Routes */}
        <Route
          path="inventory"
          element={
            <TaskEnabledLayout>
              <Inventory />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/items"
          element={
            <TaskEnabledLayout>
              <InventoryItems />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/purchase"
          element={
            <TaskEnabledLayout>
              <InventoryPurchase />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/unified-purchase"
          element={
            <TaskEnabledLayout>
              <UnifiedPurchase />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/cash-purchase"
          element={
            <TaskEnabledLayout>
              <InventoryCashPurchase />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/issue"
          element={
            <TaskEnabledLayout>
              <InventoryIssue />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/issue-inventory"
          element={
            <TaskEnabledLayout>
              <IssueInventory />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/returns"
          element={
            <TaskEnabledLayout>
              <InventoryReturns />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/sales"
          element={
            <TaskEnabledLayout>
              <InventorySales />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/sales-reports"
          element={
            <TaskEnabledLayout>
              <SalesReports />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/profit-report"
          element={
            <TaskEnabledLayout>
              <ProfitReport />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/history"
          element={
            <TaskEnabledLayout>
              <InventoryHistory />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/vendors"
          element={
            <TaskEnabledLayout>
              <InventoryVendors />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/vendor-performance"
          element={
            <TaskEnabledLayout>
              <VendorPerformance />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/vendor-performance-demo"
          element={
            <TaskEnabledLayout>
              <VendorPerformanceDemo />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/warehouses"
          element={
            <TaskEnabledLayout>
              <InventoryWarehouses />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/brands"
          element={
            <TaskEnabledLayout>
              <InventoryBrands />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/alerts"
          element={
            <TaskEnabledLayout>
              <InventoryAlerts />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/amc-tracker"
          element={
            <TaskEnabledLayout>
              <InventoryAmcTracker />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/branch-transfer"
          element={
            <TaskEnabledLayout>
              <InventoryBranchTransfer />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/warehouse-transfer"
          element={
            <TaskEnabledLayout>
              <WarehouseTransfer />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="inventory/transfer"
          element={
            <TaskEnabledLayout>
              <InventoryTransfer />
            </TaskEnabledLayout>
          }
        />
        
        {/* Quotation Routes */}
        <Route
          path="quotations"
          element={
            <TaskEnabledLayout>
              <Quotations />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="quotation-form"
          element={
            <TaskEnabledLayout>
              <QuotationForm />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="purchase-orders"
          element={
            <TaskEnabledLayout>
              <PurchaseOrders />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="purchase-order-form"
          element={
            <TaskEnabledLayout>
              <PurchaseOrderForm />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="sent-orders"
          element={
            <TaskEnabledLayout>
              <SentOrders />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="sent-quotations"
          element={
            <TaskEnabledLayout>
              <SentQuotations />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="order-history"
          element={
            <TaskEnabledLayout>
              <OrderHistory />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="quotation-products"
          element={
            <TaskEnabledLayout>
              <QuotationProducts />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="product-catalog"
          element={
            <TaskEnabledLayout>
              <ProductCatalog />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="contract-upload"
          element={
            <TaskEnabledLayout>
              <ContractUpload />
            </TaskEnabledLayout>
          }
        />
        
        {/* Finance Routes */}
        <Route
          path="finance"
          element={
            <TaskEnabledLayout>
              <FinanceDashboard />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="finance/cash-register"
          element={
            <TaskEnabledLayout>
              <CashRegister />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="finance/customer-payments"
          element={
            <TaskEnabledLayout>
              <CustomerPayments />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="finance/department-expenses"
          element={
            <TaskEnabledLayout>
              <DepartmentExpenses />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="finance/department-revenue"
          element={
            <TaskEnabledLayout>
              <DepartmentRevenue />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="finance/department-revenue-new"
          element={
            <TaskEnabledLayout>
              <DepartmentRevenueNew />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="finance/outstanding-receivables"
          element={
            <TaskEnabledLayout>
              <OutstandingReceivables />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="finance/pending-receivables"
          element={
            <TaskEnabledLayout>
              <PendingReceivables />
            </TaskEnabledLayout>
          }
        />
        
        {/* Reports Routes */}
        <Route
          path="reports"
          element={
            <TaskEnabledLayout>
              <Reports />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="reports/branch-profit"
          element={
            <TaskEnabledLayout>
              <BranchProfitReport />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="reports/customer-follow-up"
          element={
            <TaskEnabledLayout>
              <CustomerFollowUpReport />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="reports/engineer-service"
          element={
            <TaskEnabledLayout>
              <EngineerServiceReport />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="reports/machine-rental"
          element={
            <TaskEnabledLayout>
              <MachineRentalReport />
            </TaskEnabledLayout>
          }
        />
        
        {/* Locations Routes */}
        <Route
          path="locations/bhopal"
          element={
            <TaskEnabledLayout>
              <LocationBhopal />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="locations/indore"
          element={
            <TaskEnabledLayout>
              <LocationIndore />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="locations/jabalpur"
          element={
            <TaskEnabledLayout>
              <LocationJabalpur />
            </TaskEnabledLayout>
          }
        />
        
        {/* Communication Routes */}
        <Route
          path="chat"
          element={
            <TaskEnabledLayout>
              <Chat />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="chat-assistant"
          element={
            <TaskEnabledLayout>
              <ChatAssistant />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="smart-assistant"
          element={
            <TaskEnabledLayout>
              <SmartAssistant />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="telegram-admin"
          element={
            <TaskEnabledLayout>
              <TelegramAdmin />
            </TaskEnabledLayout>
          }
        />
        
        {/* User Management Route */}
        <Route
          path="user-management"
          element={
            <TaskEnabledLayout>
              <UserManagement />
            </TaskEnabledLayout>
          }
        />
        
        {/* Settings Route */}
        <Route
          path="settings"
          element={
            <TaskEnabledLayout>
              <Settings />
            </TaskEnabledLayout>
          }
        />
      </Route>

      {/* Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
