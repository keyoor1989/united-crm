
import React from "react";
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      
      <Route path="/finance" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
      <Route path="/finance/cash-register" element={<ProtectedRoute><CashRegister /></ProtectedRoute>} />
      <Route path="/finance/revenue" element={<ProtectedRoute><DepartmentRevenue /></ProtectedRoute>} />
      <Route path="/finance/expenses" element={<ProtectedRoute><DepartmentExpenses /></ProtectedRoute>} />

      <Route path="/inventory/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
      <Route path="/inventory/engineer-inventory" element={<ProtectedRoute><EngineerInventory /></ProtectedRoute>} />
      
      <Route path="/service" element={<ProtectedRoute><Service /></ProtectedRoute>} />
      <Route path="/service-call-form" element={<ProtectedRoute><ServiceCallForm /></ProtectedRoute>} />
      <Route path="/service-billing" element={<ProtectedRoute><ServiceBilling /></ProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;
