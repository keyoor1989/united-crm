
import React from "react";
import { Route } from "react-router-dom";
import TaskEnabledLayout from "@/components/layout/TaskEnabledLayout";
import Reports from "@/pages/Reports";
import BranchProfitReport from "@/pages/reports/BranchProfitReport";
import CustomerFollowUpReport from "@/pages/reports/CustomerFollowUpReport";
import EngineerServiceReport from "@/pages/reports/EngineerServiceReport";
import MachineRentalReport from "@/pages/reports/MachineRentalReport";

export const ReportsRoutes = () => {
  return (
    <>
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
    </>
  );
};
