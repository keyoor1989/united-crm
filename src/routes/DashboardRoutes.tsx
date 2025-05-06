
import React from "react";
import { Route } from "react-router-dom";
import TaskEnabledLayout from "@/components/layout/TaskEnabledLayout";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";

export const DashboardRoutes = () => {
  return (
    <>
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
    </>
  );
};
