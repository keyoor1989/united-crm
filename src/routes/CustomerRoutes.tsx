
import React from "react";
import { Route, Navigate } from "react-router-dom";
import TaskEnabledLayout from "@/components/layout/TaskEnabledLayout";
import Customers from "@/pages/Customers";
import CustomerForm from "@/pages/CustomerForm";
import CustomerFollowUps from "@/pages/customers/CustomerFollowUps";

export const CustomerRoutes = () => {
  return (
    <>
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
    </>
  );
};
