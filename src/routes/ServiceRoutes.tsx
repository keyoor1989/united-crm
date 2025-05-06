
import React from "react";
import { Route } from "react-router-dom";
import TaskEnabledLayout from "@/components/layout/TaskEnabledLayout";
import Service from "@/pages/Service";
import EngineerPerformanceDashboard from "@/pages/EngineerPerformanceDashboard";
import ServiceBilling from "@/pages/ServiceBilling";
import ServiceInventoryManagement from "@/pages/ServiceInventoryManagement";
import RentalMachines from "@/pages/service/RentalMachines";
import EngineerDetail from "@/pages/EngineerDetail";
import EngineerForm from "@/pages/EngineerForm";
import ServiceCallForm from "@/pages/ServiceCallForm";

export const ServiceRoutes = () => {
  return (
    <>
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
      <Route
        path="engineer/:id"
        element={
          <TaskEnabledLayout>
            <EngineerDetail />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="engineer-form/:id?"
        element={
          <TaskEnabledLayout>
            <EngineerForm />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="service-call-form/:id?"
        element={
          <TaskEnabledLayout>
            <ServiceCallForm />
          </TaskEnabledLayout>
        }
      />
    </>
  );
};
