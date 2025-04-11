
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Task } from "@/types/task";

// Import form components
import TaskFormHeader from "./form-components/TaskFormHeader";
import BasicInfoFields from "./form-components/BasicInfoFields";
import AssignmentFields from "./form-components/AssignmentFields";
import DateTimeFields from "./form-components/DateTimeFields";
import PriorityTypeFields from "./form-components/PriorityTypeFields";
import BranchReminderFields from "./form-components/BranchReminderFields";
import AttachmentField from "./form-components/AttachmentField";
import TaskFormFooter from "./form-components/TaskFormFooter";
import { useTaskForm } from "./form-components/useTaskForm";

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  onSubmit: (task: Partial<Task>) => void;
}

const TaskFormDialog: React.FC<TaskFormDialogProps> = ({ 
  isOpen, 
  onClose, 
  task, 
  onSubmit 
}) => {
  const { form, handleFormSubmit, isEditMode } = useTaskForm(task, onSubmit, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <TaskFormHeader isEditMode={isEditMode} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <BasicInfoFields form={form} />
            <AssignmentFields form={form} />
            <DateTimeFields form={form} />
            <PriorityTypeFields form={form} />
            <BranchReminderFields form={form} />
            <AttachmentField form={form} />
            <TaskFormFooter isEditMode={isEditMode} onClose={onClose} />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormDialog;
