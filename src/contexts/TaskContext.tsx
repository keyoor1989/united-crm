import React, { createContext, useContext, useState, useEffect } from "react";
import { Task, TaskDepartment, TaskPriority, TaskStatus, TaskType, User } from "@/types/task";
import { toast } from "sonner";
import { notifyNewTask, notifyTaskUpdate } from "@/services/taskService";
import { useAuth } from "@/contexts/AuthContext";
import { 
  fetchTasks, 
  createTask as apiCreateTask, 
  updateTask as apiUpdateTask, 
  deleteTask as apiDeleteTask,
  getTaskById as apiGetTaskById
} from "@/services/taskApiService";
import { userService } from "@/services/userService";

interface TaskContextType {
  tasks: Task[];
  myTasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (updatedTask: Task) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  getTaskById: (taskId: string) => Promise<Task | null>;
  users: User[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  console.log("TaskContext - Current user:", user); // Debug log

  // Filter tasks for the current user
  const myTasks = tasks.filter(task => 
    task.assignedTo.id === user?.id || 
    task.assignedTo.email === user?.email
  );

  // Load tasks on component mount
  useEffect(() => {
    if (user) {
      console.log("TaskContext - Loading tasks for user:", user.id);
      loadTasks();
      loadUsers();
    }
  }, [user]);

  // Load all tasks
  const loadTasks = async () => {
    setLoading(true);
    try {
      console.log("TaskContext - Fetching tasks from API");
      const tasksData = await fetchTasks();
      console.log("TaskContext - Fetched tasks:", tasksData);
      setTasks(tasksData);
      setError(null);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError("Failed to load tasks");
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // Load all users from the database
  const loadUsers = async () => {
    try {
      // Attempt to fetch all users from the database using userService
      const allUsers = await userService.getUsers();
      console.log("TaskContext - Fetched users:", allUsers);
      
      // Map users to the format expected by the Task components
      const mappedUsers: User[] = allUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department as TaskDepartment || "Admin",
      }));
      
      setUsers(mappedUsers);
    } catch (err) {
      console.error("Failed to load users:", err);
      
      // Fallback: If we can't fetch users, at least include the current user
      if (user) {
        const currentUserData: User = {
          id: user.id,
          name: user.name || user.email.split('@')[0],
          email: user.email,
          role: user.role || "admin",
          department: "Admin" as TaskDepartment,
        };
        setUsers([currentUserData]);
      }
    }
  };

  const addTask = async (taskData: Partial<Task>) => {
    setLoading(true);
    try {
      if (!user) throw new Error("User must be logged in to create tasks");

      console.log("TaskContext - Adding new task:", taskData);

      // Create a task with current user as creator
      const taskWithUser: Partial<Task> = {
        ...taskData,
        createdBy: {
          id: user.id,
          name: user.name || user.email.split('@')[0],
          email: user.email,
          role: user.role || "admin",
          department: taskData.department || "Admin" as TaskDepartment,
        },
        status: "Assigned",
      };
      
      const newTask = await apiCreateTask(taskWithUser);
      console.log("TaskContext - New task created:", newTask);
      
      // Update local state
      setTasks(prev => [newTask, ...prev]);
      
      // Notify about new task creation via Telegram if it's assigned to someone else
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
      // Find the original task to check for status change
      const originalTask = tasks.find(task => task.id === updatedTask.id);
      const statusChanged = originalTask && originalTask.status !== updatedTask.status;
      
      // Update the task in the API
      const result = await apiUpdateTask(updatedTask.id, updatedTask);
      
      // Update the task in the state
      setTasks(prev =>
        prev.map(task => (task.id === updatedTask.id ? result : task))
      );

      // If status changed to completed, notify via Telegram
      if (statusChanged && updatedTask.status === "Completed") {
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
      // Delete the task from the API
      await apiDeleteTask(taskId);
      
      // Remove the task from the state
      setTasks(prev => prev.filter(task => task.id !== taskId));
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
      // First check if the task is already in the state
      const cachedTask = tasks.find(task => task.id === taskId);
      if (cachedTask) return cachedTask;
      
      // If not, fetch it from the API
      return await apiGetTaskById(taskId);
    } catch (err) {
      console.error("Error getting task by ID:", err);
      return null;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        myTasks,
        loading,
        error,
        addTask,
        updateTask,
        deleteTask,
        getTaskById,
        users,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}
