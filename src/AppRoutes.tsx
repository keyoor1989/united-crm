import React from "react";
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import FinanceDashboard from "@/pages/finance/FinanceDashboard";
import DepartmentRevenue from "@/pages/finance/DepartmentRevenue";
import DepartmentExpenses from "@/pages/finance/DepartmentExpenses";
import CashRegister from "@/pages/finance/CashRegister";
import Payments from "@/pages/finance/Payments";
import Receivables from "@/pages/finance/Receivables";
import InventoryDashboard from "@/pages/inventory/InventoryDashboard";
import Brands from "@/pages/inventory/Brands";
import Models from "@/pages/inventory/Models";
import Items from "@/pages/inventory/Items";
import Warehouses from "@/pages/inventory/Warehouses";
import Vendors from "@/pages/inventory/Vendors";
import PurchaseEntries from "@/pages/inventory/PurchaseEntries";
import IssueEntries from "@/pages/inventory/IssueEntries";
import StockTransferRequests from "@/pages/inventory/StockTransferRequests";
import StockReturns from "@/pages/inventory/StockReturns";
import EngineerInventory from "@/pages/inventory/EngineerInventory";
import MachinePartsUsage from "@/pages/inventory/MachinePartsUsage";
import Sales from "@/pages/inventory/Sales";
import AMCContracts from "@/pages/inventory/AMCContracts";
import Service from "@/pages/Service";
import ServiceCallForm from "@/pages/ServiceCallForm";
// Add the new import
import ServiceBilling from "@/pages/ServiceBilling";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/finance" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
      <Route path="/finance/cash-register" element={<ProtectedRoute><CashRegister /></ProtectedRoute>} />
      <Route path="/finance/revenue" element={<ProtectedRoute><DepartmentRevenue /></ProtectedRoute>} />
      <Route path="/finance/expenses" element={<ProtectedRoute><DepartmentExpenses /></ProtectedRoute>} />
      <Route path="/finance/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/finance/receivables" element={<ProtectedRoute><Receivables /></ProtectedRoute>} />

      <Route path="/inventory" element={<ProtectedRoute><InventoryDashboard /></ProtectedRoute>} />
      <Route path="/inventory/brands" element={<ProtectedRoute><Brands /></ProtectedRoute>} />
      <Route path="/inventory/models" element={<ProtectedRoute><Models /></ProtectedRoute>} />
      <Route path="/inventory/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
      <Route path="/inventory/warehouses" element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />
      <Route path="/inventory/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
      <Route path="/inventory/purchases" element={<ProtectedRoute><PurchaseEntries /></ProtectedRoute>} />
      <Route path="/inventory/issues" element={<ProtectedRoute><IssueEntries /></ProtectedRoute>} />
      <Route path="/inventory/stock-transfers" element={<ProtectedRoute><StockTransferRequests /></ProtectedRoute>} />
      <Route path="/inventory/stock-returns" element={<ProtectedRoute><StockReturns /></ProtectedRoute>} />
      <Route path="/inventory/engineer-inventory" element={<ProtectedRoute><EngineerInventory /></ProtectedRoute>} />
      <Route path="/inventory/machine-parts-usage" element={<ProtectedRoute><MachinePartsUsage /></ProtectedRoute>} />
      <Route path="/inventory/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
      <Route path="/inventory/amc-contracts" element={<ProtectedRoute><AMCContracts /></ProtectedRoute>} />
      
      <Route path="/service" element={<ProtectedRoute><Service /></ProtectedRoute>} />
      <Route path="/service-call-form" element={<ProtectedRoute><ServiceCallForm /></ProtectedRoute>} />
      <Route path="/service-billing" element={<ProtectedRoute><ServiceBilling /></ProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;
