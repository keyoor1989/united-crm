
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
          path="inventory/*"
          element={
            <TaskEnabledLayout>
              <Inventory />
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
          path="finance/*"
          element={
            <TaskEnabledLayout>
              <FinanceDashboard />
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
          path="reports/*"
          element={
            <TaskEnabledLayout>
              <Reports />
            </TaskEnabledLayout>
          }
        />
        
        {/* User Management */}
        <Route
          path="user-management"
          element={
            <TaskEnabledLayout>
              <UserManagement />
            </TaskEnabledLayout>
          }
        />
        
        {/* Communication Routes */}
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
