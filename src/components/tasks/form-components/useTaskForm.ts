
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import { formSchema, FormValues } from "./types";
import { useAuth } from "@/contexts/AuthContext";
import { useTaskContext } from "@/contexts/TaskContext";

export function useTaskForm(task: Task | undefined, onSubmit: (task: Partial<Task>) => void, onClose: () => void) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { users } = useTaskContext();
  const isEditMode = !!task;

  // Get current user info
  const currentUser = user ? {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: task?.department || "Admin",
  } : null;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      assignedTo: task?.assignedTo.id || user?.id || "",
      department: task?.department || "Admin",
      dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
      dueTime: task?.dueDate ? format(new Date(task.dueDate), "HH:mm") : "12:00",
      priority: task?.priority || "Medium",
      type: task?.type || "Personal",
      hasReminder: task?.hasReminder || false,
      branch: task?.branch || user?.branch || "Indore",
      attachments: task?.attachments || [],
    },
  });

  const handleFormSubmit = (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to create or update tasks",
        variant: "destructive"
      });
      return;
    }

    // Combine date and time
    const [hours, minutes] = values.dueTime.split(":").map(Number);
    const dueDate = new Date(values.dueDate);
    dueDate.setHours(hours, minutes);

    // Find the assigned user from users list or use current user
    const assignedUser = users.find(u => u.id === values.assignedTo) || currentUser;

    if (!assignedUser) {
      toast({
        title: "Error",
        description: "Could not find the assigned user",
        variant: "destructive"
      });
      return;
    }

    const taskData: Partial<Task> = {
      ...values,
      dueDate,
      assignedTo: assignedUser,
      createdBy: task?.createdBy || currentUser,
      status: task?.status || "Assigned",
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
