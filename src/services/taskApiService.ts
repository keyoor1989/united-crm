
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus, TaskPriority, TaskDepartment } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

// Convert database task to app task
export const mapDbTaskToTask = (dbTask: any): Task => {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    assignedTo: {
      id: dbTask.assigned_to_user?.id || dbTask.assigned_to,
      name: dbTask.assigned_to_user?.name || 'Unknown User',
      email: dbTask.assigned_to_user?.email || '',
      role: dbTask.assigned_to_user?.role || '',
      department: dbTask.department as TaskDepartment,
    },
    createdBy: {
      id: dbTask.created_by_user?.id || dbTask.created_by,
      name: dbTask.created_by_user?.name || 'Unknown User',
      email: dbTask.created_by_user?.email || '',
      role: dbTask.created_by_user?.role || '',
      department: dbTask.department as TaskDepartment,
    },
    department: dbTask.department as TaskDepartment,
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
  return {
    title: task.title,
    description: task.description,
    assigned_to: task.assignedTo?.id,
    created_by: task.createdBy?.id,
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

// Fetch all tasks for the current user
export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const { data: dbTasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_user:assigned_to(id, name, email, role),
        created_by_user:created_by(id, name, email, role)
      `)
      .order('due_date', { ascending: true });

    if (error) {
      throw error;
    }

    return dbTasks.map(mapDbTaskToTask);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Create a new task
export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
  try {
    const dbTask = mapTaskToDbTask(taskData);
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(dbTask)
      .select(`
        *,
        assigned_to_user:assigned_to(id, name, email, role),
        created_by_user:created_by(id, name, email, role)
      `)
      .single();

    if (error) {
      throw error;
    }

    return mapDbTaskToTask(data);
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update an existing task
export const updateTask = async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
  try {
    const dbTask = mapTaskToDbTask(taskData);
    dbTask.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('tasks')
      .update(dbTask)
      .eq('id', taskId)
      .select(`
        *,
        assigned_to_user:assigned_to(id, name, email, role),
        created_by_user:created_by(id, name, email, role)
      `)
      .single();

    if (error) {
      throw error;
    }

    return mapDbTaskToTask(data);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Get task by ID
export const getTaskById = async (taskId: string): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_user:assigned_to(id, name, email, role),
        created_by_user:created_by(id, name, email, role)
      `)
      .eq('id', taskId)
      .single();

    if (error) {
      throw error;
    }

    return data ? mapDbTaskToTask(data) : null;
  } catch (error) {
    console.error('Error fetching task by ID:', error);
    throw error;
  }
};
