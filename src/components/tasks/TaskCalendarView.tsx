
import React, { useState } from "react";
import { format, isSameDay, isToday, startOfMonth, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import TaskFormDialog from "./TaskFormDialog";
import { DayProps } from "react-day-picker";

interface TaskCalendarViewProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ tasks, onTaskUpdate }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleDayClick = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const tasksOnSelectedDate = selectedDate 
    ? tasks.filter(task => isSameDay(new Date(task.dueDate), selectedDate))
    : [];

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsViewDialogOpen(true);
  };

  const handleUpdateTask = (updatedTask: Partial<Task>) => {
    if (selectedTask) {
      onTaskUpdate({
        ...selectedTask,
        ...updatedTask
      } as Task);
    }
  };

  // Function to render task dots on calendar days
  const renderDay = (day: Date) => {
    // Get tasks for this day
    const tasksOnDay = tasks.filter(task => isSameDay(new Date(task.dueDate), day));
    
    if (tasksOnDay.length === 0) return undefined;
    
    // Get the highest priority task
    const highPriorityTask = tasksOnDay.find(task => task.priority === "High");
    const mediumPriorityTask = tasksOnDay.find(task => task.priority === "Medium");
    
    let dotClassName = "h-1.5 w-1.5 absolute bottom-1 rounded-full";
    
    if (highPriorityTask) {
      dotClassName += " bg-red-500";
    } else if (mediumPriorityTask) {
      dotClassName += " bg-amber-500";
    } else {
      dotClassName += " bg-blue-500";
    }
    
    // Show count for multiple tasks
    return (
      <div className="relative">
        <div className={dotClassName}></div>
        {tasksOnDay.length > 1 && (
          <span className="absolute bottom-1 right-1 text-[8px] font-medium">
            {tasksOnDay.length}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/2 lg:w-1/3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDayClick}
          className="border rounded-md p-3"
          components={{
            Day: ({ date, ...dayProps }: DayProps) => (
              <div
                {...dayProps}
                className={cn(
                  dayProps.className,
                  isToday(date) && "bg-accent text-accent-foreground",
                  "relative"
                )}
              >
                {format(date, "d")}
                {renderDay(date)}
              </div>
            ),
          }}
        />
      </div>
      
      <div className="md:w-1/2 lg:w-2/3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              {selectedDate 
                ? `Tasks for ${format(selectedDate, "MMMM d, yyyy")}`
                : "Select a date to view tasks"}
            </CardTitle>
            <CardDescription>
              {selectedDate && `${tasksOnSelectedDate.length} tasks scheduled for this day`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <div className="text-center py-8 text-muted-foreground">
                Click on a date to view tasks scheduled for that day
              </div>
            ) : tasksOnSelectedDate.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks scheduled for this day
              </div>
            ) : (
              <div className="space-y-4">
                {tasksOnSelectedDate.map((task) => {
                  const priorityColor = 
                    task.priority === "High" ? "bg-red-100 text-red-800 border-red-200" :
                    task.priority === "Medium" ? "bg-amber-100 text-amber-800 border-amber-200" :
                    "bg-blue-100 text-blue-800 border-blue-200";
                  
                  return (
                    <div 
                      key={task.id} 
                      className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleViewTask(task)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge className={cn("ml-2", priorityColor)}>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                      
                      <Separator className="my-2" />
                      
                      <div className="flex justify-between text-xs">
                        <span>Due: {format(new Date(task.dueDate), "h:mm a")}</span>
                        <span>Assigned to: {task.assignedTo.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedTask && (
        <TaskFormDialog
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onSubmit={handleUpdateTask}
        />
      )}
    </div>
  );
};

export default TaskCalendarView;
