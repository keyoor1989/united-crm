
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import { currentUser } from "@/data/taskData";
import { formSchema, FormValues } from "./types";

export function useTaskForm(task: Task | undefined, onSubmit: (task: Partial<Task>) => void, onClose: () => void) {
  const { toast } = useToast();
  const isEditMode = !!task;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      assignedTo: task?.assignedTo.id || currentUser.id,
      department: task?.department || currentUser.department,
      dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
      dueTime: task?.dueDate ? format(new Date(task.dueDate), "HH:mm") : "12:00",
      priority: task?.priority || "Medium",
      type: task?.type || "Personal",
      hasReminder: task?.hasReminder || false,
      branch: task?.branch || "Indore",
      attachments: task?.attachments || [],
    },
  });

  const handleFormSubmit = (values: FormValues) => {
    // Combine date and time
    const [hours, minutes] = values.dueTime.split(":").map(Number);
    const dueDate = new Date(values.dueDate);
    dueDate.setHours(hours, minutes);

    // Find the assigned user object from the ID
    const assignedUser = mockUsers.find(user => user.id === values.assignedTo);

    const taskData: Partial<Task> = {
      ...values,
      dueDate,
      assignedTo: assignedUser!,
      createdBy: currentUser,
      status: task?.status || "Assigned",
      id: task?.id || `task-${Date.now()}`,
      createdAt: task?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSubmit(taskData);
    toast({
      title: isEditMode ? "Task updated" : "Task created",
      description: isEditMode 
        ? "The task has been updated successfully." 
        : "The task has been created successfully.",
    });
    onClose();
  };

  return { form, handleFormSubmit, isEditMode };
}

// Need to import mockUsers
import { mockUsers } from "@/data/taskData";
