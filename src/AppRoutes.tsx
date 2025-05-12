
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AccessDenied from "@/pages/AccessDenied";
import NotFound from "@/pages/NotFound";
import TaskEnabledLayout from "@/components/layout/TaskEnabledLayout";

// Import all pages individually rather than relying on the route components
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import TaskDashboard from "@/pages/tasks/TaskDashboard";
import UserManagement from "@/pages/user-management/UserManagement";
import Settings from "@/pages/Settings";
import LocationBhopal from "@/pages/locations/LocationBhopal";
import LocationIndore from "@/pages/locations/LocationIndore";
import LocationJabalpur from "@/pages/locations/LocationJabalpur";
import Chat from "@/pages/Chat";
import ChatAssistant from "@/pages/ChatAssistant";
import SmartAssistant from "@/pages/SmartAssistant";
import TelegramAdmin from "@/pages/TelegramAdmin";
import Customers from "@/pages/Customers";
import CustomerForm from "@/pages/CustomerForm";
import CustomerFollowUps from "@/pages/customers/CustomerFollowUps";
import Reports from "@/pages/Reports";
import BranchProfitReport from "@/pages/reports/BranchProfitReport";
import CustomerFollowUpReport from "@/pages/reports/CustomerFollowUpReport";
import EngineerServiceReport from "@/pages/reports/EngineerServiceReport";
import MachineRentalReport from "@/pages/reports/MachineRentalReport";
import Service from "@/pages/Service";
import EngineerPerformanceDashboard from "@/pages/EngineerPerformanceDashboard";
import ServiceBilling from "@/pages/ServiceBilling";
import ServiceInventoryManagement from "@/pages/ServiceInventoryManagement";
import RentalMachines from "@/pages/service/RentalMachines";
import EngineerDetail from "@/pages/EngineerDetail";
import EngineerForm from "@/pages/EngineerForm";
import ServiceCallForm from "@/pages/ServiceCallForm";
import FinanceDashboard from "@/pages/finance/FinanceDashboard";
import CashRegister from "@/pages/finance/CashRegister";
import CustomerPayments from "@/pages/finance/CustomerPayments";
import DepartmentExpenses from "@/pages/finance/DepartmentExpenses";
import DepartmentRevenue from "@/pages/finance/DepartmentRevenue";
import DepartmentRevenueNew from "@/pages/finance/DepartmentRevenueNew";
import OutstandingReceivables from "@/pages/finance/OutstandingReceivables";
import PendingReceivables from "@/pages/finance/PendingReceivables";
import Quotations from "@/pages/sales/Quotations";
import QuotationForm from "@/pages/sales/QuotationForm";
import PurchaseOrders from "@/pages/sales/PurchaseOrders";
import PurchaseOrderForm from "@/pages/sales/PurchaseOrderForm";
import SentOrders from "@/pages/sales/SentOrders";
import SentQuotations from "@/pages/sales/SentQuotations";
import OrderHistory from "@/pages/sales/OrderHistory";
import QuotationProducts from "@/pages/sales/QuotationProducts";
import ProductCatalog from "@/pages/sales/ProductCatalog";
import ContractUpload from "@/pages/sales/ContractUpload";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes - Public */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="access-denied" element={<AccessDenied />} />
      <Route path="*" element={<NotFound />} />

      {/* Protected Routes with Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard Routes */}
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
        
        {/* Task Routes */}
        <Route
          path="tasks"
          element={
            <TaskEnabledLayout>
              <TaskDashboard />
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
        <Route
          path="customer-form"
          element={<Navigate to="/customer" replace />}
        />
        <Route
          path="customer-form/:id"
          element={<Navigate to="/customer/:id" replace />}
        />
        <Route
          path="customers/follow-ups"
          element={
            <TaskEnabledLayout>
              <CustomerFollowUps />
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
        
        {/* Sales Routes */}
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
        
        {/* Location Routes */}
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
        
        {/* User Management Routes */}
        <Route
          path="user-management"
          element={
            <TaskEnabledLayout>
              <UserManagement />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="settings"
          element={
            <TaskEnabledLayout>
              <Settings />
            </TaskEnabledLayout>
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
