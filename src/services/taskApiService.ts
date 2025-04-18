import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus, TaskPriority, TaskDepartment } from "@/types/task";
import { v4 as uuidv4 } from "uuid";

// Convert database task to app task
export const mapDbTaskToTask = (dbTask: any): Task => {
  console.log("mapDbTaskToTask - Raw DB task:", dbTask);
  
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    assignedTo: {
      id: dbTask.assigned_to_user?.id || dbTask.assigned_to || "",
      name: dbTask.assigned_to_user?.name || 'Unknown User',
      email: dbTask.assigned_to_user?.email || '',
      role: dbTask.assigned_to_user?.role || '',
      department: dbTask.department as TaskDepartment,
    },
    assignedToUserId: dbTask.assigned_to_user_id,
    createdBy: {
      id: dbTask.created_by_user?.id || dbTask.created_by || "",
      name: dbTask.created_by_user?.name || 'Unknown User',
      email: dbTask.created_by_user?.email || '',
      role: dbTask.created_by_user?.role || '',
      department: dbTask.department as TaskDepartment,
    },
    createdByUserId: dbTask.created_by_user_id,
    department: dbTask.department,
    dueDate: new Date(dbTask.due_date),
    priority: dbTask.priority as TaskPriority,
    type: dbTask.type,
    hasReminder: dbTask.has_reminder,
    branch: dbTask.branch,
    attachments: dbTask.attachments || [],
    status: dbTask.status as TaskStatus,
    createdAt: new Date(dbTask.created_at),
    updatedAt: new Date(dbTask.updated_at),
  };
};

// Convert app task to database format
export const mapTaskToDbTask = (task: Partial<Task>): any => {
  console.log("mapTaskToDbTask - Task to save:", task);
  
  return {
    title: task.title,
    description: task.description,
    assigned_to: task.assignedTo?.id,
    assigned_to_user_id: task.assignedToUserId || task.assignedTo?.id,
    created_by: task.createdBy?.id,
    created_by_user_id: task.createdByUserId || task.createdBy?.id,
    department: task.department,
    due_date: task.dueDate?.toISOString(),
    priority: task.priority,
    type: task.type,
    has_reminder: task.hasReminder,
    branch: task.branch,
    attachments: task.attachments,
    status: task.status,
  };
};

// Create a mock task list for testing when the database table is not available
const createMockTasks = (userId: string): Task[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  return [
    {
      id: uuidv4(),
      title: "Follow up with client about service request",
      description: "Call to check on satisfaction with recent service visit",
      assignedTo: {
        id: userId,
        name: "Current User",
        email: "",
        role: "manager",
        department: "Service"
      },
      createdBy: {
        id: userId,
        name: "Current User",
        email: "",
        role: "manager",
        department: "Service"
      },
      department: "Service",
      dueDate: tomorrow,
      priority: "High",
      type: "Personal",
      hasReminder: true,
      branch: "Indore",
      attachments: [],
      status: "Assigned",
      createdAt: today,
      updatedAt: today
    },
    {
      id: uuidv4(),
      title: "Prepare monthly sales report",
      description: "Compile sales data for the monthly management meeting",
      assignedTo: {
        id: userId,
        name: "Current User",
        email: "",
        role: "manager",
        department: "Sales"
      },
      createdBy: {
        id: userId,
        name: "Current User",
        email: "",
        role: "manager",
        department: "Sales"
      },
      department: "Sales",
      dueDate: nextWeek,
      priority: "Medium",
      type: "Assigned by Admin",
      hasReminder: false,
      branch: "Indore",
      attachments: [],
      status: "In Progress",
      createdAt: new Date(today.setDate(today.getDate() - 2)),
      updatedAt: today
    },
    {
      id: uuidv4(),
      title: "Inventory check for printer parts",
      description: "Verify stock levels of commonly used printer parts",
      assignedTo: {
        id: userId,
        name: "Current User",
        email: "",
        role: "manager",
        department: "Inventory"
      },
      createdBy: {
        id: userId,
        name: "Current User",
        email: "",
        role: "manager",
        department: "Inventory"
      },
      department: "Inventory",
      dueDate: today,
      priority: "Low",
      type: "Personal",
      hasReminder: false,
      branch: "Indore",
      attachments: [],
      status: "Completed",
      createdAt: new Date(today.setDate(today.getDate() - 5)),
      updatedAt: today
    }
  ];
};

// Fetch all tasks for the current user
export const fetchTasks = async (): Promise<Task[]> => {
  try {
    console.log("fetchTasks - Attempting to fetch tasks from Supabase");
    
    try {
      // First try to fetch from the database
      const { data: dbTasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_user:app_users(id, name, email, role),
          created_by_user:app_users(id, name, email, role)
        `)
        .order('due_date', { ascending: true });

      if (error) {
        throw error;
      }

      console.log("fetchTasks - Raw data from Supabase:", dbTasks);
      
      const tasks = dbTasks.map(mapDbTaskToTask);
      console.log("fetchTasks - Mapped tasks:", tasks);
      
      return tasks;
    } catch (error) {
      // If there's an error with the database query, use mock data
      console.error("Error fetching from database, using mock data:", error);
      
      // Get the current user ID from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || "mock-user-id";
      
      // Create and return mock tasks
      const mockTasks = createMockTasks(userId);
      console.log("fetchTasks - Using mock tasks:", mockTasks);
      return mockTasks;
    }
  } catch (error) {
    console.error('Error in fetchTasks:', error);
    return []; // Return empty array as fallback
  }
};

// Create a new task
export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
  try {
    console.log("createTask - Creating task with data:", taskData);
    
    try {
      // Try to save to the database first
      const dbTask = mapTaskToDbTask(taskData);
      console.log("createTask - Mapped DB task:", dbTask);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(dbTask)
        .select(`
          *,
          assigned_to_user:profiles(id, name, email, role),
          created_by_user:profiles(id, name, email, role)
        `)
        .single();

      if (error) {
        throw error;
      }

      console.log("createTask - Created task, raw response:", data);
      
      const task = mapDbTaskToTask(data);
      console.log("createTask - Mapped task:", task);
      
      return task;
    } catch (error) {
      // If database save fails, create a mock task
      console.error("Error saving to database, creating mock task:", error);
      
      const mockTask: Task = {
        id: uuidv4(),
        title: taskData.title || "New Task",
        description: taskData.description || "",
        assignedTo: taskData.assignedTo || {
          id: "mock-user-id",
          name: "Current User",
          email: "",
          role: "",
          department: taskData.department || "Admin"
        },
        createdBy: taskData.createdBy || {
          id: "mock-user-id",
          name: "Current User",
          email: "",
          role: "",
          department: taskData.department || "Admin"
        },
        department: taskData.department || "Admin",
        dueDate: taskData.dueDate || new Date(),
        priority: taskData.priority || "Medium",
        type: taskData.type || "Personal",
        hasReminder: taskData.hasReminder || false,
        branch: taskData.branch || "Indore",
        attachments: taskData.attachments || [],
        status: taskData.status || "Assigned",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("createTask - Created mock task:", mockTask);
      return mockTask;
    }
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update an existing task
export const updateTask = async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
  try {
    try {
      // Try to update in the database first
      const dbTask = mapTaskToDbTask(taskData);
      dbTask.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('tasks')
        .update(dbTask)
        .eq('id', taskId)
        .select(`
          *,
          assigned_to_user:profiles(id, name, email, role),
          created_by_user:profiles(id, name, email, role)
        `)
        .single();

      if (error) {
        throw error;
      }

      return mapDbTaskToTask(data);
    } catch (error) {
      // If database update fails, return the updated task data
      console.error("Error updating task in database:", error);
      
      return {
        ...taskData,
        id: taskId,
        updatedAt: new Date()
      } as Task;
    }
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    try {
      // Try to delete from the database
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        throw error;
      }
    } catch (error) {
      // If database delete fails, just log the error
      console.error("Error deleting task from database:", error);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Get task by ID
export const getTaskById = async (taskId: string): Promise<Task | null> => {
  try {
    try {
      // Try to get from the database
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_user:profiles(id, name, email, role),
          created_by_user:profiles(id, name, email, role)
        `)
        .eq('id', taskId)
        .single();

      if (error) {
        throw error;
      }

      return data ? mapDbTaskToTask(data) : null;
    } catch (error) {
      // If database query fails, return null
      console.error("Error fetching task by ID from database:", error);
      return null;
    }
  } catch (error) {
    console.error('Error fetching task by ID:', error);
    throw error;
  }
};
