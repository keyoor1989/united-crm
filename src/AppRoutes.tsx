
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
import AmcConsumables from "@/pages/AmcConsumables";
import CustomerForm from "@/pages/CustomerForm";
import EngineerDetail from "@/pages/EngineerDetail";
import Customers from "@/pages/Customers";
import AccessDenied from "@/pages/AccessDenied";
import CustomerFollowUps from "@/pages/customers/CustomerFollowUps";
import EngineerPerformanceDashboard from "@/pages/EngineerPerformanceDashboard";

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
        
        <Route path="/finance" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
        <Route path="/finance/cash-register" element={<ProtectedRoute><CashRegister /></ProtectedRoute>} />
        <Route path="/finance/revenue" element={<ProtectedRoute><DepartmentRevenue /></ProtectedRoute>} />
        <Route path="/finance/expenses" element={<ProtectedRoute><DepartmentExpenses /></ProtectedRoute>} />

        <Route path="/inventory/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
        <Route path="/inventory/engineer-inventory" element={<ProtectedRoute><EngineerInventory /></ProtectedRoute>} />
        
        <Route path="/service" element={<ProtectedRoute><Service /></ProtectedRoute>} />
        <Route path="/service-call-form" element={<ProtectedRoute><ServiceCallForm /></ProtectedRoute>} />
        <Route path="/service-billing" element={<ProtectedRoute><ServiceBilling /></ProtectedRoute>} />
        <Route path="/amc-consumables" element={<ProtectedRoute><AmcConsumables /></ProtectedRoute>} />
        <Route path="/engineer/:id" element={<ProtectedRoute><EngineerDetail /></ProtectedRoute>} />
        <Route path="/engineer-performance" element={<ProtectedRoute><EngineerPerformanceDashboard /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
