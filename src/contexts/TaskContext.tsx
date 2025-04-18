
import React, { createContext, useContext, useState, useEffect } from "react";
import { Task, User } from "@/types/task";
import { useAuth } from "@/contexts/AuthContext";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { useTaskUsers } from "@/hooks/useTaskUsers";

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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { users, loadUsers } = useTaskUsers();
  const { 
    loading, 
    error, 
    loadTasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    getTaskById 
  } = useTaskOperations(user);

  console.log("TaskContext - Current user:", user);

  const myTasks = tasks.filter(task => 
    task.assignedTo.id === user?.id || 
    task.assignedToUserId === user?.id
  );

  useEffect(() => {
    // Only load tasks when the user is authenticated and not in loading state
    if (isAuthenticated && user && !authLoading) {
      console.log("TaskContext - Loading tasks for user:", user.id);
      const initializeData = async () => {
        const tasksData = await loadTasks();
        setTasks(tasksData);
        try {
          await loadUsers();
        } catch (error) {
          console.error("Failed to load users:", error);
        }
      };
      initializeData();
    }
  }, [isAuthenticated, user, authLoading]);

  const contextValue: TaskContextType = {
    tasks,
    myTasks,
    loading: loading || authLoading,
    error,
    addTask: async (taskData) => {
      const newTask = await addTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    },
    updateTask: async (updatedTask) => {
      const result = await updateTask(updatedTask);
      setTasks(prev =>
        prev.map(task => (task.id === updatedTask.id ? result : task))
      );
      return result;
    },
    deleteTask: async (taskId) => {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    },
    getTaskById,
    users,
  };

  return (
    <TaskContext.Provider value={contextValue}>
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
