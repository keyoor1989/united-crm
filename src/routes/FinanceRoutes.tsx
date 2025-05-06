
import React from "react";
import { Route } from "react-router-dom";
import TaskEnabledLayout from "@/components/layout/TaskEnabledLayout";
import FinanceDashboard from "@/pages/finance/FinanceDashboard";
import CashRegister from "@/pages/finance/CashRegister";
import CustomerPayments from "@/pages/finance/CustomerPayments";
import DepartmentExpenses from "@/pages/finance/DepartmentExpenses";
import DepartmentRevenue from "@/pages/finance/DepartmentRevenue";
import DepartmentRevenueNew from "@/pages/finance/DepartmentRevenueNew";
import OutstandingReceivables from "@/pages/finance/OutstandingReceivables";
import PendingReceivables from "@/pages/finance/PendingReceivables";

export const FinanceRoutes = () => {
  return (
    <>
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
    </>
  );
};
