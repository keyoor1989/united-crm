
import React, { useState } from "react";
import { format } from "date-fns";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TaskTableHeader from "./table-components/TaskTableHeader";
import TaskTableBody from "./table-components/TaskTableBody";
import TaskDeleteDialog from "./table-components/TaskDeleteDialog";
import TaskFormDialog from "./TaskFormDialog";
import { exportToCsv, exportToPdf } from "@/utils/exportUtils";

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

  const handleTaskUpdate = (updatedTaskData: Partial<Task>) => {
    if (selectedTask) {
      const updatedTask = {
        ...selectedTask,
        ...updatedTaskData
      } as Task;
      
      onTaskUpdate(updatedTask);
    }
  };

  const exportTasks = (exportFormat: 'csv' | 'pdf') => {
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

    if (exportFormat === 'csv') {
      exportToCsv(formattedTasks, 'Tasks');
      toast({
        title: "Export successful",
        description: "Tasks have been exported to CSV",
      });
    } else if (exportFormat === 'pdf') {
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
        <TaskTableHeader />
        <TaskTableBody 
          tasks={tasks}
          onViewTask={handleViewTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={onTaskUpdate}
        />
      </div>

      {selectedTask && (
        <>
          <TaskFormDialog
            isOpen={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
            onSubmit={handleTaskUpdate}
          />

          <TaskDeleteDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={confirmDeleteTask}
            taskTitle={selectedTask.title}
          />
        </>
      )}
    </>
  );
};

export default TaskTable;
