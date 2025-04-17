
import React from "react";
import { Outlet } from "react-router-dom";
import { TaskProvider } from "@/contexts/TaskContext";
import Layout from "./Layout";

const TaskEnabledLayout = () => {
  return (
    <Layout>
      <TaskProvider>
        <Outlet />
      </TaskProvider>
    </Layout>
  );
};

export default TaskEnabledLayout;
