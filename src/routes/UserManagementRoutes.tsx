
import React from "react";
import { Route } from "react-router-dom";
import TaskEnabledLayout from "@/components/layout/TaskEnabledLayout";
import UserManagement from "@/pages/user-management/UserManagement";
import Settings from "@/pages/Settings";

export const UserManagementRoutes = () => {
  return (
    <>
      <Route
        path="user-management"
        element={
          <TaskEnabledLayout>
            <UserManagement />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="settings"
        element={
          <TaskEnabledLayout>
            <Settings />
          </TaskEnabledLayout>
        }
      />
    </>
  );
};
