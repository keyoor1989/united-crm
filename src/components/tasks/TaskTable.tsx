
import React, { useState } from "react";
import { format, isAfter, isBefore, isToday } from "date-fns";
import { 
  AlertCircle, 
  Bell, 
  BellOff, 
  Check, 
  Clock, 
  Edit, 
  Eye, 
  Loader2, 
  MoreHorizontal, 
  Trash,
  FileText,
  Download 
} from "lucide-react";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task, TaskStatus } from "@/types/task";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TaskFormDialog from "./TaskFormDialog";
import { exportToCsv, exportToPdf } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface TaskTableProps {
  tasks: Task[];
  isMyTasks?: boolean;
  onTaskUpdate: (updatedTask: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

const TaskTable: React.FC<TaskTableProps> = ({ 
  tasks, 
  isMyTasks = false,
  onTaskUpdate, 
  onTaskDelete 
}) => {
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState<string | null>(null);

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTask = () => {
    if (selectedTask) {
      onTaskDelete(selectedTask.id);
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    }
    setIsDeleteDialogOpen(false);
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    setIsStatusUpdating(task.id);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedTask = {
      ...task,
      status: newStatus,
      updatedAt: new Date()
    };
    
    onTaskUpdate(updatedTask);
    setIsStatusUpdating(null);
    
    toast({
      title: "Status updated",
      description: `Task marked as ${newStatus}`,
    });
  };

  const handleTaskUpdate = (updatedTaskData: Partial<Task>) => {
    if (selectedTask) {
      const updatedTask = {
        ...selectedTask,
        ...updatedTaskData
      } as Task;
      
      onTaskUpdate(updatedTask);
    }
  };

  const isOverdue = (dueDate: Date) => {
    return isBefore(new Date(dueDate), new Date()) && !isToday(new Date(dueDate));
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge variant="destructive">{priority}</Badge>;
      case "Medium":
        return <Badge variant="default" className="bg-amber-500">{priority}</Badge>;
      case "Low":
        return <Badge variant="outline">{priority}</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "Assigned":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">{status}</Badge>;
      case "In Progress":
        return <Badge variant="default" className="bg-amber-500">{status}</Badge>;
      case "Completed":
        return <Badge variant="default" className="bg-green-500">{status}</Badge>;
      case "Missed":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportTasks = (format: 'csv' | 'pdf') => {
    const formattedTasks = tasks.map(task => ({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo.name,
      department: task.department,
      dueDate: format(new Date(task.dueDate), 'PPp'),
      priority: task.priority,
      type: task.type,
      status: task.status,
      branch: task.branch,
      hasReminder: task.hasReminder ? 'Yes' : 'No',
    }));

    if (format === 'csv') {
      exportToCsv(formattedTasks, 'Tasks');
      toast({
        title: "Export successful",
        description: "Tasks have been exported to CSV",
      });
    } else if (format === 'pdf') {
      exportToPdf(formattedTasks, 'Tasks Report');
      toast({
        title: "Export successful",
        description: "Tasks have been exported to PDF",
      });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {isMyTasks ? "My Tasks" : "All Tasks"} ({tasks.length})
        </h2>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportTasks('csv')}>
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportTasks('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reminder</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow 
                  key={task.id}
                  className={
                    isOverdue(task.dueDate) && task.status !== "Completed" 
                      ? "bg-red-50 dark:bg-red-950/10" 
                      : ""
                  }
                >
                  <TableCell className="font-medium max-w-[200px] truncate" title={task.title}>
                    {task.title}
                  </TableCell>
                  <TableCell>{task.assignedTo.name}</TableCell>
                  <TableCell>{task.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {isOverdue(task.dueDate) && task.status !== "Completed" && (
                        <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      {format(new Date(task.dueDate), "MMM d, h:mm a")}
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    {task.hasReminder ? (
                      <Bell className="h-4 w-4 text-blue-500" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {task.status !== "Completed" && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleStatusChange(task, "Completed")}
                          disabled={isStatusUpdating === task.id}
                          className="h-8 w-8"
                        >
                          {isStatusUpdating === task.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewTask(task)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTask(task)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTask(task)}
                            className="text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                          
                          {task.status !== "Completed" && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(task, "In Progress")}>
                                <Clock className="h-4 w-4 mr-2" />
                                Mark as In Progress
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => handleStatusChange(task, "Completed")}>
                                <Check className="h-4 w-4 mr-2" />
                                Mark as Completed
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedTask && (
        <TaskFormDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onSubmit={handleTaskUpdate}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{selectedTask?.title}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskTable;
