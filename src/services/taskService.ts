
import { toast } from "sonner";
import { Task } from "@/types/task";
import { format } from "date-fns";
import { notifyFollowUp } from "@/services/telegramService";

export const notifyNewTask = async (task: Task) => {
  // Show in-app toast notification
  toast.info("New Task Assigned", {
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
  toast.info("Task Updated", {
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
  toast.info("Task Reminder", {
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

export const createTask = (task: Task): void => {
  try {
    console.log("Creating task:", task);
    toast.success("Task created successfully", {
      description: `Task "${task.title}" has been created`
    });
  } catch (error) {
    console.error("Error creating task:", error);
    toast.error("Failed to create task", {
      description: "There was an error creating the task. Please try again."
    });
  }
};

export const updateTask = (task: Task): void => {
  try {
    console.log("Updating task:", task);
    toast.success("Task updated successfully", {
      description: `Task "${task.title}" has been updated`
    });
  } catch (error) {
    console.error("Error updating task:", error);
    toast.error("Failed to update task", {
      description: "There was an error updating the task. Please try again."
    });
  }
};

export const deleteTask = (task: Task): void => {
  try {
    console.log("Deleting task:", task);
    toast.success("Task deleted successfully", {
      description: `Task "${task.title}" has been deleted`
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    toast.error("Failed to delete task", {
      description: "There was an error deleting the task. Please try again."
    });
  }
};
