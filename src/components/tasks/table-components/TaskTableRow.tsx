
import React from "react";
import { format, isBefore, isToday } from "date-fns";
import { 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Trash 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Task, TaskStatus } from "@/types/task";

interface TaskTableRowProps {
  task: Task;
  isStatusUpdating: boolean;
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
}

const TaskTableRow: React.FC<TaskTableRowProps> = ({ 
  task, 
  isStatusUpdating,
  onViewTask, 
  onEditTask, 
  onDeleteTask,
  onStatusChange
}) => {
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

  return (
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
              onClick={() => onStatusChange(task, "Completed")}
              disabled={isStatusUpdating}
              className="h-8 w-8"
            >
              {isStatusUpdating ? (
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
              <DropdownMenuItem onClick={() => onViewTask(task)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditTask(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDeleteTask(task)}
                className="text-red-600"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
              
              {task.status !== "Completed" && (
                <>
                  <DropdownMenuItem onClick={() => onStatusChange(task, "In Progress")}>
                    <Clock className="h-4 w-4 mr-2" />
                    Mark as In Progress
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => onStatusChange(task, "Completed")}>
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
  );
};

export default TaskTableRow;
