
import { z } from "zod";
import { TaskDepartment, TaskPriority, TaskType } from "@/types/task";

export const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  assignedTo: z.string(),
  department: z.enum(["Sales", "Service", "Admin", "Inventory", "Rental"] as const),
  dueDate: z.date(),
  dueTime: z.string(),
  priority: z.enum(["Low", "Medium", "High"] as const),
  type: z.enum(["Personal", "Assigned by Admin"] as const),
  hasReminder: z.boolean(),
  branch: z.string(),
  attachments: z.array(z.string()).optional(),
});

export type FormValues = z.infer<typeof formSchema>;
