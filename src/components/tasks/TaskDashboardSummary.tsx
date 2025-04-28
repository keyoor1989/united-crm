
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertTriangle, CheckSquare } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";
import { isToday, isBefore, isThisMonth } from "date-fns";

const TaskDashboardSummary = () => {
  // Try to use the task context, but handle the case when it's not available
  let tasks = [];
  let contextError = false;
  
  try {
    const { tasks: contextTasks } = useTaskContext();
    tasks = contextTasks;
  } catch (error) {
    console.warn("TaskContext not available, using empty task list");
    contextError = true;
  }
  
  // If there's no task context, show a simplified version with zeros
  if (contextError) {
    const summaryItems = [
      {
        title: "Due Today",
        value: 0,
        icon: <Clock className="h-5 w-5 text-blue-500" />,
        color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200",
        textColor: "text-blue-700 dark:text-blue-400",
      },
      {
        title: "Completed Today",
        value: 0,
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        color: "bg-green-50 dark:bg-green-950/20 border-green-200",
        textColor: "text-green-700 dark:text-green-400",
      },
      {
        title: "Overdue",
        value: 0,
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        color: "bg-red-50 dark:bg-red-950/20 border-red-200",
        textColor: "text-red-700 dark:text-red-400",
      },
      {
        title: "Completed This Month",
        value: 0,
        icon: <CheckSquare className="h-5 w-5 text-purple-500" />,
        color: "bg-purple-50 dark:bg-purple-950/20 border-purple-200",
        textColor: "text-purple-700 dark:text-purple-400",
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryItems.map((item, index) => (
          <Card key={index} className={`border ${item.color}`}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </p>
                <h3 className={`text-2xl font-bold mt-1 ${item.textColor}`}>
                  {item.value}
                </h3>
              </div>
              <div
                className={`p-2 rounded-full ${item.color} flex items-center justify-center`}
              >
                {item.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // Normal processing with available tasks
  console.log("TaskDashboardSummary - tasks:", tasks); // Debug log
  
  // Filter tasks for dashboard summary
  const tasksDueToday = tasks.filter(task => 
    isToday(new Date(task.dueDate)) && task.status !== "Completed");
  
  const tasksCompletedToday = tasks.filter(task => 
    task.status === "Completed" && isToday(new Date(task.updatedAt)));
  
  const overdueTasks = tasks.filter(task => 
    isBefore(new Date(task.dueDate), new Date()) && task.status !== "Completed");
  
  const tasksCompletedThisMonth = tasks.filter(task => 
    task.status === "Completed" && isThisMonth(new Date(task.updatedAt)));

  const summaryItems = [
    {
      title: "Due Today",
      value: tasksDueToday.length,
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200",
      textColor: "text-blue-700 dark:text-blue-400",
    },
    {
      title: "Completed Today",
      value: tasksCompletedToday.length,
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      color: "bg-green-50 dark:bg-green-950/20 border-green-200",
      textColor: "text-green-700 dark:text-green-400",
    },
    {
      title: "Overdue",
      value: overdueTasks.length,
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      color: "bg-red-50 dark:bg-red-950/20 border-red-200",
      textColor: "text-red-700 dark:text-red-400",
    },
    {
      title: "Completed This Month",
      value: tasksCompletedThisMonth.length,
      icon: <CheckSquare className="h-5 w-5 text-purple-500" />,
      color: "bg-purple-50 dark:bg-purple-950/20 border-purple-200",
      textColor: "text-purple-700 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryItems.map((item, index) => (
        <Card key={index} className={`border ${item.color}`}>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {item.title}
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${item.textColor}`}>
                {item.value}
              </h3>
            </div>
            <div
              className={`p-2 rounded-full ${item.color} flex items-center justify-center`}
            >
              {item.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TaskDashboardSummary;
