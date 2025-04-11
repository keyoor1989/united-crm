
import React from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TaskFormHeaderProps {
  isEditMode: boolean;
}

const TaskFormHeader: React.FC<TaskFormHeaderProps> = ({ isEditMode }) => {
  return (
    <DialogHeader>
      <DialogTitle>{isEditMode ? "Edit Task" : "Create New Task"}</DialogTitle>
    </DialogHeader>
  );
};

export default TaskFormHeader;
