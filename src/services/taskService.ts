
import { toast } from "sonner";
import { Task } from "@/types/task";

// Function to create a new task
export const createTask = (task: Task): void => {
  try {
    // In a real app, this would make an API call to save the task
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

// Function to update an existing task
export const updateTask = (task: Task): void => {
  try {
    // In a real app, this would make an API call to update the task
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

// Function to delete a task
export const deleteTask = (task: Task): void => {
  try {
    // In a real app, this would make an API call to delete the task
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
