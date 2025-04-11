
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Check, FilePen, User } from "lucide-react";
import { Task } from "@/types/task";
import { toast } from "sonner";
import { formatTaskTime } from "@/utils/chatCommands/taskParser";

interface TaskCreationViewProps {
  task: Task;
}

const TaskCreationView: React.FC<TaskCreationViewProps> = ({ task }) => {
  const handleMarkAsDone = () => {
    toast.info(`Feature coming soon: Mark task as done`);
  };

  const handleEditTask = () => {
    toast.info(`Feature coming soon: Edit task`);
  };

  const handleOpenCRM = () => {
    toast.info(`Feature coming soon: Open customer in CRM`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Task Created
        </Badge>
      </div>

      <Card className="p-4 border-l-4 border-l-blue-500">
        <div className="flex items-center mb-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <CalendarClock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-lg">{task.title}</h3>
            <p className="text-muted-foreground text-sm">Due on {formatTaskTime(task.dueDate)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Assigned to: <span className="font-medium">{task.assignedTo.name}</span></span>
          </div>
          
          {task.description && (
            <div className="text-sm mt-2">
              <span className="text-muted-foreground">Notes:</span>
              <p className="mt-1">{task.description}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleMarkAsDone}
          >
            <Check className="h-4 w-4" />
            Mark as Done
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleEditTask}
          >
            <FilePen className="h-4 w-4" />
            Edit Task
          </Button>
          <Button 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleOpenCRM}
          >
            <User className="h-4 w-4" />
            Open CRM
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TaskCreationView;
