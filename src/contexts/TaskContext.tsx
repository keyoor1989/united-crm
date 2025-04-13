
import React, { createContext, useContext, useState, useEffect } from "react";
import { Task, TaskDepartment, TaskPriority, TaskStatus, TaskType, User } from "@/types/task";
import { mockTasks, mockUsers, currentUser, getTasksByStatus, getTasksAssignedToUser } from "@/data/taskData";
import { toast } from "sonner";
import { notifyNewTask, notifyTaskUpdate } from "@/services/taskService";

interface TaskContextType {
  tasks: Task[];
  myTasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (task: Partial<Task>) => void;
  updateTask: (updatedTask: Task) => void;
  deleteTask: (taskId: string) => void;
  getTaskById: (taskId: string) => Task | undefined;
  users: User[];
  currentUser: User;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter tasks for the current user
  const myTasks = tasks.filter(task => task.assignedTo.id === currentUser.id);

  const addTask = (taskData: Partial<Task>) => {
    setLoading(true);
    try {
      // Create a unique ID
      const id = `task-${Date.now()}`;
      // Create a new task object
      const newTask: Task = {
        id,
        title: taskData.title || "",
        description: taskData.description || "",
        assignedTo: taskData.assignedTo || currentUser,
        createdBy: currentUser,
        department: taskData.department || currentUser.department,
        dueDate: taskData.dueDate || new Date(),
        priority: taskData.priority || "Medium",
        type: taskData.type || "Personal",
        hasReminder: taskData.hasReminder || false,
        branch: taskData.branch || "Indore",
        attachments: taskData.attachments || [],
        status: "Assigned",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add the new task to the state
      setTasks(prev => [newTask, ...prev]);
      
      // Notify about new task creation via Telegram if it's assigned to someone else
      if (newTask.assignedTo.id !== currentUser.id) {
        notifyNewTask(newTask);
      }

      toast.success("Task created successfully");
      setLoading(false);
      return newTask;
    } catch (err) {
      setError("Failed to create task");
      toast.error("Failed to create task");
      setLoading(false);
      throw err;
    }
  };

  const updateTask = (updatedTask: Task) => {
    setLoading(true);
    try {
      // Find the original task to check for status change
      const originalTask = tasks.find(task => task.id === updatedTask.id);
      const statusChanged = originalTask && originalTask.status !== updatedTask.status;
      
      // Update the task in the state
      setTasks(prev =>
        prev.map(task => (task.id === updatedTask.id ? updatedTask : task))
      );

      // If status changed to completed, notify via Telegram
      if (statusChanged && updatedTask.status === "Completed") {
        notifyTaskUpdate(updatedTask);
      }

      toast.success("Task updated successfully");
      setLoading(false);
      return updatedTask;
    } catch (err) {
      setError("Failed to update task");
      toast.error("Failed to update task");
      setLoading(false);
      throw err;
    }
  };

  const deleteTask = (taskId: string) => {
    setLoading(true);
    try {
      // Remove the task from the state
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success("Task deleted successfully");
      setLoading(false);
    } catch (err) {
      setError("Failed to delete task");
      toast.error("Failed to delete task");
      setLoading(false);
      throw err;
    }
  };

  const getTaskById = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
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
        users: mockUsers,
        currentUser,
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
