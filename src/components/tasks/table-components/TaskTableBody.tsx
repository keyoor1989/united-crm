
import React, { useState } from "react";
import { format, isAfter, isBefore, isToday } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { Task, TaskStatus } from "@/types/task";
import TaskTableRow from "./TaskTableRow";

interface TaskTableBodyProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStatusChange: (task: Task) => void;
}

const TaskTableBody: React.FC<TaskTableBodyProps> = ({ 
  tasks, 
  onViewTask, 
  onEditTask, 
  onDeleteTask,
  onStatusChange
}) => {
  const [isStatusUpdating, setIsStatusUpdating] = useState<string | null>(null);

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    setIsStatusUpdating(task.id);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedTask = {
      ...task,
      status: newStatus,
      updatedAt: new Date()
    };
    
    onStatusChange(updatedTask);
    setIsStatusUpdating(null);
  };

  return (
    <TableBody>
      {tasks.length === 0 ? (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
            No tasks found.
          </TableCell>
        </TableRow>
      ) : (
        tasks.map((task) => (
          <TaskTableRow
            key={task.id}
            task={task}
            isStatusUpdating={isStatusUpdating === task.id}
            onViewTask={onViewTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onStatusChange={handleStatusChange}
          />
        ))
      )}
    </TableBody>
  );
};

export default TaskTableBody;
