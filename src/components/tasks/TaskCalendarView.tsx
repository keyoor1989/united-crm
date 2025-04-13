
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/types/task";
import { format, isEqual, isBefore, isToday } from "date-fns";
import TaskFormDialog from "./TaskFormDialog";

interface TaskCalendarViewProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ tasks, onTaskUpdate }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  // Get tasks for the selected date
  const getTasksForDate = (day: Date | undefined) => {
    if (!day) return [];
    
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === day.getDate() &&
        taskDate.getMonth() === day.getMonth() &&
        taskDate.getFullYear() === day.getFullYear()
      );
    });
  };

  // Get selected date tasks
  const selectedDateTasks = getTasksForDate(date);

  // Function to handle task click
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  // Render day contents (to show task indicators)
  const renderDayContents = (day: Date) => {
    const dayTasks = getTasksForDate(day);
    const hasOverdueTasks = dayTasks.some(
      task => isBefore(new Date(task.dueDate), new Date()) && 
              task.status !== "Completed"
    );
    const hasHighPriorityTasks = dayTasks.some(task => task.priority === "High");
    
    return (
      <div className="relative">
        {dayTasks.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div className="flex gap-0.5">
              {hasOverdueTasks && (
                <div className="h-1 w-1 rounded-full bg-red-500" />
              )}
              {hasHighPriorityTasks && !hasOverdueTasks && (
                <div className="h-1 w-1 rounded-full bg-amber-500" />
              )}
              {!hasHighPriorityTasks && !hasOverdueTasks && dayTasks.length > 0 && (
                <div className="h-1 w-1 rounded-full bg-blue-500" />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Function to handle task update
  const handleTaskUpdate = (taskData: Partial<Task>) => {
    if (selectedTask) {
      const updatedTask = { ...selectedTask, ...taskData, updatedAt: new Date() };
      onTaskUpdate(updatedTask as Task);
    }
  };

  return (
    <div className="grid md:grid-cols-[1fr_300px] gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Task Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            components={{
              DayContent: ({ date: dayDate }) => (
                <>
                  {dayDate.getDate()}
                  {renderDayContents(dayDate)}
                </>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {date ? format(date, "PPP") : "No date selected"}
            {isToday(date as Date) && (
              <Badge className="ml-2 bg-blue-500">Today</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateTasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tasks for this date</p>
          ) : (
            <div className="space-y-2">
              {selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-2 rounded-md border cursor-pointer hover:bg-accent/50 ${
                    task.status === "Completed" 
                      ? "border-green-200 bg-green-50 dark:bg-green-950/20" 
                      : task.priority === "High" 
                      ? "border-red-200 bg-red-50 dark:bg-red-950/20" 
                      : "border-gray-200"
                  }`}
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{task.title}</h3>
                    <Badge variant={
                      task.status === "Completed" 
                        ? "success" 
                        : task.status === "In Progress" 
                        ? "default" 
                        : "outline"
                    }>
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs">{format(new Date(task.dueDate), "h:mm a")}</span>
                    <span className="text-xs">Assigned to: {task.assignedTo.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTask && (
        <TaskFormDialog
          isOpen={isTaskDialogOpen}
          onClose={() => {
            setIsTaskDialogOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onSubmit={handleTaskUpdate}
        />
      )}
    </div>
  );
};

export default TaskCalendarView;
