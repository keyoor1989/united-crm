
import { useState } from "react";
import { Task } from "@/types/task";
import { toast } from "sonner";
import { 
  fetchTasks, 
  createTask as apiCreateTask, 
  updateTask as apiUpdateTask, 
  deleteTask as apiDeleteTask,
  getTaskById as apiGetTaskById
} from "@/services/taskApiService";
import { notifyNewTask, notifyTaskUpdate } from "@/services/taskService";

export const useTaskOperations = (user: any) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async () => {
    setLoading(true);
    try {
      console.log("TaskContext - Fetching tasks from API");
      const tasksData = await fetchTasks();
      console.log("TaskContext - Fetched tasks:", tasksData);
      setError(null);
      return tasksData;
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError("Failed to load tasks");
      toast.error("Failed to load tasks");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: Partial<Task>) => {
    setLoading(true);
    try {
      if (!user) throw new Error("User must be logged in to create tasks");

      console.log("TaskContext - Adding new task:", taskData);

      const taskWithUser: Partial<Task> = {
        ...taskData,
        createdBy: {
          id: user.id,
          name: user.name || user.email.split('@')[0],
          email: user.email,
          role: user.role || "admin",
          department: taskData.department || "Admin",
        },
        status: "Assigned",
      };
      
      const newTask = await apiCreateTask(taskWithUser);
      console.log("TaskContext - New task created:", newTask);
      
      if (newTask.assignedTo.id !== user.id) {
        notifyNewTask(newTask);
      }

      toast.success("Task created successfully");
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (updatedTask: Task) => {
    setLoading(true);
    try {
      const result = await apiUpdateTask(updatedTask.id, updatedTask);
      
      if (updatedTask.status === "Completed") {
        notifyTaskUpdate(updatedTask);
      }

      toast.success("Task updated successfully");
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update task";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setLoading(true);
    try {
      await apiDeleteTask(taskId);
      toast.success("Task deleted successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete task";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTaskById = async (taskId: string) => {
    try {
      return await apiGetTaskById(taskId);
    } catch (err) {
      console.error("Error getting task by ID:", err);
      return null;
    }
  };

  return {
    loading,
    error,
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
  };
};
