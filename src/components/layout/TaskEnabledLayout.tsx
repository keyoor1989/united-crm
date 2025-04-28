
import React from "react";
import { Outlet } from "react-router-dom";
import { TaskProvider } from "@/contexts/TaskContext";

const TaskEnabledLayout = () => {
  return (
    <TaskProvider>
      <Outlet />
    </TaskProvider>
  );
};

export default TaskEnabledLayout;
