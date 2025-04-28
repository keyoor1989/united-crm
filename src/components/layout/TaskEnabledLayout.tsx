
import React from "react";
import { TaskProvider } from "@/contexts/TaskContext";

interface TaskEnabledLayoutProps {
  children: React.ReactNode;
}

const TaskEnabledLayout: React.FC<TaskEnabledLayoutProps> = ({ children }) => {
  return (
    <TaskProvider>
      {children}
    </TaskProvider>
  );
};

export default TaskEnabledLayout;
