
import { Task } from "@/types/task";
import { toast } from "sonner";
import { format } from "date-fns";
import { notifyFollowUp } from "@/services/telegramService";

export const notifyNewTask = async (task: Task) => {
  // Show in-app toast notification
  toast({
    title: "New Task Assigned",
    description: `Task "${task.title}" has been assigned to ${task.assignedTo.name}`,
  });

  // Send Telegram notification
  try {
    await notifyFollowUp({
      type: "task_assignment",
      customer_name: task.assignedTo.name,
      notes: `New task: ${task.title}. Due: ${format(new Date(task.dueDate), "PPp")}`,
      date: new Date().toISOString(),
      status: task.status,
    });
    return true;
  } catch (error) {
    console.error("Error sending task notification:", error);
    return false;
  }
};

export const notifyTaskUpdate = async (task: Task) => {
  // Show in-app toast notification
  toast({
    title: "Task Updated",
    description: `Task "${task.title}" has been marked as ${task.status}`,
  });

  // Send Telegram notification for completed tasks
  if (task.status === "Completed") {
    try {
      await notifyFollowUp({
        type: "task_completion",
        customer_name: task.assignedTo.name,
        notes: `Task completed: ${task.title}`,
        date: new Date().toISOString(),
        status: "Completed",
      });
      return true;
    } catch (error) {
      console.error("Error sending task completion notification:", error);
      return false;
    }
  }

  return true;
};

export const notifyTaskReminder = async (task: Task) => {
  // Show in-app toast notification
  toast({
    title: "Task Reminder",
    description: `Reminder: Task "${task.title}" is due soon.`,
  });

  // Send Telegram notification
  try {
    await notifyFollowUp({
      type: "task_reminder",
      customer_name: task.assignedTo.name,
      notes: `Reminder: Task "${task.title}" is due on ${format(new Date(task.dueDate), "PPp")}`,
      date: new Date().toISOString(),
      status: task.status,
    });
    return true;
  } catch (error) {
    console.error("Error sending task reminder notification:", error);
    return false;
  }
};
