
import { Command } from "../types";
import { Task, TaskPriority, TaskDepartment, TaskStatus } from "@/types/task";
import { v4 as uuidv4 } from "uuid";

/**
 * Extracts task information from a chat command
 */
export const parseTaskCommand = (input: string): Partial<Task> | null => {
  try {
    // Use regex to extract task information
    const titleRegex = /title:\s*(.+?)(?=\s+description:|$)/i;
    const descriptionRegex = /description:\s*(.+?)(?=\s+due:|$)/i;
    const dueRegex = /due:\s*(.+?)(?=\s+priority:|$)/i;
    const priorityRegex = /priority:\s*(.+?)(?=\s+department:|$)/i;
    const departmentRegex = /department:\s*(.+?)(?=\s+type:|$)/i;
    const typeRegex = /type:\s*(.+?)(?=\s+assignedTo:|$)/i;
    const assignedToRegex = /assignedTo:\s*(.+?)(?=$)/i;

    // Extract values using regex
    const titleMatch = input.match(titleRegex);
    const descriptionMatch = input.match(descriptionRegex);
    const dueMatch = input.match(dueRegex);
    const priorityMatch = input.match(priorityRegex);
    const departmentMatch = input.match(departmentRegex);
    const typeMatch = input.match(typeRegex);
    const assignedToMatch = input.match(assignedToRegex);

    // Create task with basic information
    const task: Partial<Task> = {
      title: titleMatch ? titleMatch[1].trim() : "",
      description: descriptionMatch ? descriptionMatch[1].trim() : "",
      dueDate: dueMatch ? new Date(dueMatch[1].trim()) : new Date(),
      priority: (priorityMatch ? priorityMatch[1].trim() : "Medium") as TaskPriority,
      department: (departmentMatch ? departmentMatch[1].trim() : "Admin") as TaskDepartment,
      type: typeMatch ? typeMatch[1].trim() : "Personal",
      status: "Assigned" as TaskStatus,
      hasReminder: false,
      attachments: []
    };

    // Default: create a placeholder for assigned user
    // The actual user assignment will happen at task creation in the context
    const defaultAssignee = {
      id: "", // This will be replaced with actual user ID when task is created
      name: assignedToMatch ? assignedToMatch[1].trim() : "Current User",
      email: "",
      role: "",
      department: task.department || "Admin"
    };

    task.assignedTo = defaultAssignee;

    return task;
  } catch (error) {
    console.error("Error parsing task command:", error);
    return null;
  }
};

/**
 * Command handler for creating tasks via chat
 */
export const taskCommand: Command = {
  command: "task",
  description: "Create a new task",
  exampleUsage: "/task title: Follow up with client description: Call John about the printer quote due: tomorrow priority: High department: Sales",
  handler: async (input: string) => {
    const task = parseTaskCommand(input);
    
    if (!task) {
      return {
        type: "text",
        content: "I couldn't understand the task details. Please try using the format: title: Task Name description: Task details due: date priority: Low/Medium/High department: DepartmentName type: Personal/Assigned",
      };
    }

    return {
      type: "task-creation",
      content: task,
    };
  },
};
