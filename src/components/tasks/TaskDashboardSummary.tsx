
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertTriangle, CheckSquare } from "lucide-react";
import {
  getTasksDueToday,
  getTasksCompletedToday,
  getOverdueTasks,
  getTasksCompletedThisMonth
} from "@/data/taskData";

const TaskDashboardSummary = () => {
  const tasksDueToday = getTasksDueToday();
  const tasksCompletedToday = getTasksCompletedToday();
  const overdueTasks = getOverdueTasks();
  const tasksCompletedThisMonth = getTasksCompletedThisMonth();

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
