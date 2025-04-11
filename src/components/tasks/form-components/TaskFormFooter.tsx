
import React from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TaskFormFooterProps {
  isEditMode: boolean;
  onClose: () => void;
}

const TaskFormFooter: React.FC<TaskFormFooterProps> = ({ isEditMode, onClose }) => {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onClose} className="mr-2">
        Cancel
      </Button>
      <Button type="submit">
        {isEditMode ? "Update Task" : "Create Task"}
      </Button>
    </DialogFooter>
  );
};

export default TaskFormFooter;
