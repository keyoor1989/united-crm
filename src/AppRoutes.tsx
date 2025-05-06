
import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  AuthRoutes,
  CustomerRoutes,
  DashboardRoutes,
  ServiceRoutes,
  InventoryRoutes,
  SalesRoutes,
  FinanceRoutes,
  ReportsRoutes,
  LocationRoutes,
  CommunicationRoutes,
  TaskRoutes,
  UserManagementRoutes
} from "./routes";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes - Public */}
      <AuthRoutes />

      {/* Protected Routes with Layout and Tasks */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard Routes */}
        <DashboardRoutes />
        
        {/* Customer Routes */}
        <CustomerRoutes />
        
        {/* Task Routes */}
        <TaskRoutes />
        
        {/* Service Routes */}
        <ServiceRoutes />
        
        {/* Inventory Routes */}
        <InventoryRoutes />
        
        {/* Sales Routes */}
        <SalesRoutes />
        
        {/* Finance Routes */}
        <FinanceRoutes />
        
        {/* Reports Routes */}
        <ReportsRoutes />
        
        {/* Location Routes */}
        <LocationRoutes />
        
        {/* Communication Routes */}
        <CommunicationRoutes />
        
        {/* User Management & Settings Routes */}
        <UserManagementRoutes />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
