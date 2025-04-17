
import { Task, TaskPriority, TaskDepartment, TaskStatus, TaskType } from "@/types/task";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

// Interface for parsed task data that includes validation fields
export interface ParsedTask extends Partial<Task> {
  isValid: boolean;
  missingFields: string[];
  taskTitle?: string;
}

/**
 * Formats a date for display in task view
 */
export const formatTaskTime = (date: Date): string => {
  return format(new Date(date), "PPP");
};

/**
 * Extracts task information from a chat command
 */
export const parseTaskCommand = (input: string): ParsedTask => {
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

    // Track missing fields for validation
    const missingFields: string[] = [];
    if (!titleMatch) missingFields.push("title");
    if (!descriptionMatch) missingFields.push("description");
    if (!dueMatch) missingFields.push("dueDate");
    if (!assignedToMatch) missingFields.push("assignedTo");
    if (!departmentMatch) missingFields.push("department");

    // Create task with basic information
    const parsedTask: ParsedTask = {
      title: titleMatch ? titleMatch[1].trim() : "",
      description: descriptionMatch ? descriptionMatch[1].trim() : "",
      dueDate: dueMatch ? new Date(dueMatch[1].trim()) : new Date(),
      priority: (priorityMatch ? priorityMatch[1].trim() : "Medium") as TaskPriority,
      department: (departmentMatch ? departmentMatch[1].trim() : "Admin") as TaskDepartment,
      type: (typeMatch ? typeMatch[1].trim() : "Personal") as TaskType,
      status: "Assigned" as TaskStatus,
      hasReminder: false,
      attachments: [],
      isValid: missingFields.length === 0,
      missingFields: missingFields,
      taskTitle: titleMatch ? titleMatch[1].trim() : ""
    };

    // Default: create a placeholder for assigned user
    // The actual user assignment will happen at task creation in the context
    const defaultAssignee = {
      id: "", // This will be replaced with actual user ID when task is created
      name: assignedToMatch ? assignedToMatch[1].trim() : "Current User",
      email: "",
      role: "",
      department: parsedTask.department || "Admin"
    };

    parsedTask.assignedTo = defaultAssignee;

    return parsedTask;
  } catch (error) {
    console.error("Error parsing task command:", error);
    return {
      isValid: false,
      missingFields: ["parsing_error"],
      title: "",
      description: "",
      dueDate: new Date(),
      status: "Assigned" as TaskStatus
    };
  }
};

/**
 * Creates a new task from a parsed task input
 */
export const createNewTask = (parsedTask: ParsedTask): Task => {
  const now = new Date();
  
  return {
    id: uuidv4(),
    title: parsedTask.title || "New Task",
    description: parsedTask.description || "",
    assignedTo: parsedTask.assignedTo || {
      id: "",
      name: "Current User",
      email: "",
      role: "",
      department: parsedTask.department || "Admin"
    },
    createdBy: {
      id: "",
      name: "Current User",
      email: "",
      role: "",
      department: parsedTask.department || "Admin"
    },
    department: parsedTask.department || "Admin",
    dueDate: parsedTask.dueDate || new Date(now.setDate(now.getDate() + 1)),
    priority: parsedTask.priority || "Medium",
    type: parsedTask.type || "Personal",
    hasReminder: parsedTask.hasReminder || false,
    branch: parsedTask.branch || "",
    attachments: parsedTask.attachments || [],
    status: parsedTask.status || "Assigned",
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Command handler for creating tasks via chat
 */
export const taskCommand = {
  command: "task",
  description: "Create a new task",
  exampleUsage: "/task title: Follow up with client description: Call John about the printer quote due: tomorrow priority: High department: Sales",
  handler: async (input: string) => {
    const task = parseTaskCommand(input);
    
    if (!task.isValid) {
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
