
import { LucideIcon } from "lucide-react";

export type TaskPriority = "Low" | "Medium" | "High";
export type TaskStatus = "Assigned" | "In Progress" | "Completed" | "Missed";
export type TaskType = "Personal" | "Assigned by Admin";
export type TaskDepartment = "Sales" | "Service" | "Admin" | "Inventory" | "Rental";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: TaskDepartment;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: User;
  assignedToUserId?: string;
  createdBy: User;
  createdByUserId?: string;
  department: TaskDepartment;
  dueDate: Date;
  priority: TaskPriority;
  type: TaskType;
  hasReminder: boolean;
  branch: string;
  attachments?: string[];
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}
