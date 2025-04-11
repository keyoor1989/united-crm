
import { Task, TaskDepartment, TaskPriority, TaskStatus, TaskType, User } from "@/types/task";
import { addDays, addHours, subDays } from "date-fns";

export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    department: "Admin",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    department: "Sales",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert@example.com",
    role: "User",
    department: "Service",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    role: "User",
    department: "Inventory",
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michael@example.com",
    role: "User",
    department: "Rental",
  },
];

// Current user for demo purposes
export const currentUser = mockUsers[0];

// Create a function to generate random tasks
function generateMockTasks(count: number): Task[] {
  const now = new Date();
  const tasks: Task[] = [];

  for (let i = 0; i < count; i++) {
    const daysOffset = Math.floor(Math.random() * 14) - 7; // Range from -7 to 7 days
    const createdBy = mockUsers[0]; // Admin creates tasks
    const assignedTo = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const department = assignedTo.department;

    const priorityValues: TaskPriority[] = ["Low", "Medium", "High"];
    const statusValues: TaskStatus[] = ["Assigned", "In Progress", "Completed", "Missed"];
    const typeValues: TaskType[] = ["Personal", "Assigned by Admin"];
    
    const priority = priorityValues[Math.floor(Math.random() * priorityValues.length)];
    const status = statusValues[Math.floor(Math.random() * statusValues.length)];
    const type = typeValues[Math.floor(Math.random() * typeValues.length)];
    
    const dueDate = addDays(now, daysOffset);
    if (status === "Missed" && dueDate > now) {
      dueDate.setDate(dueDate.getDate() - 10); // Ensure missed tasks have past due dates
    }

    const task: Task = {
      id: `task-${i + 1}`,
      title: `Task ${i + 1}`,
      description: `This is a ${priority.toLowerCase()} priority task for the ${department} department.`,
      assignedTo,
      createdBy,
      department,
      dueDate,
      priority,
      type,
      hasReminder: Math.random() > 0.5,
      branch: ["Indore", "Bhopal", "Jabalpur"][Math.floor(Math.random() * 3)],
      status,
      createdAt: subDays(now, Math.floor(Math.random() * 30)),
      updatedAt: now,
    };

    tasks.push(task);
  }

  return tasks;
}

export const mockTasks = generateMockTasks(30);

// Utility functions for the task data
export const getTasksDueToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return mockTasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime() && task.status !== "Completed";
  });
};

export const getTasksCompletedToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return mockTasks.filter(task => {
    const updatedDate = new Date(task.updatedAt);
    return updatedDate >= today && updatedDate < tomorrow && task.status === "Completed";
  });
};

export const getOverdueTasks = () => {
  const now = new Date();
  
  return mockTasks.filter(task => {
    return new Date(task.dueDate) < now && task.status !== "Completed";
  });
};

export const getTasksCompletedThisMonth = () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return mockTasks.filter(task => {
    const updatedDate = new Date(task.updatedAt);
    return updatedDate >= firstDayOfMonth && task.status === "Completed";
  });
};

export const getTasksByStatus = (status: TaskStatus) => {
  return mockTasks.filter(task => task.status === status);
};

export const getTasksByPriority = (priority: TaskPriority) => {
  return mockTasks.filter(task => task.priority === priority);
};

export const getTasksByDepartment = (department: TaskDepartment) => {
  return mockTasks.filter(task => task.department === department);
};

export const getTasksAssignedToUser = (userId: string) => {
  return mockTasks.filter(task => task.assignedTo.id === userId);
};

export const getTasksCreatedByUser = (userId: string) => {
  return mockTasks.filter(task => task.createdBy.id === userId);
};
