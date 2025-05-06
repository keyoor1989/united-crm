
import React from "react";
import { Route } from "react-router-dom";
import TaskEnabledLayout from "@/components/layout/TaskEnabledLayout";
import TaskDashboard from "@/pages/tasks/TaskDashboard";

export const TaskRoutes = () => {
  return (
    <>
      <Route
        path="tasks"
        element={
          <TaskEnabledLayout>
            <TaskDashboard />
          </TaskEnabledLayout>
        }
      />
    </>
  );
};
