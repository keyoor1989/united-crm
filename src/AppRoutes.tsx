
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
          path="/dashboard"
          element={
            <TaskEnabledLayout>
              <Dashboard />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="/customers"
          element={
            <TaskEnabledLayout>
              <Customers />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="/customer/:id?"
          element={
            <TaskEnabledLayout>
              <CustomerForm />
            </TaskEnabledLayout>
          }
        />
        <Route
          path="/tasks"
          element={
            <TaskEnabledLayout>
              <TaskDashboard />
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
