
import React from "react";
import { Link } from "react-router-dom";
import { 
  CalendarCheck, 
  CalendarClock, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getTasksDueToday, 
  getTasksCompletedToday, 
  getOverdueTasks,
  getTasksCompletedThisMonth
} from "@/data/taskData";

const TaskSummaryCard = ({ 
  title, 
  description, 
  count, 
  icon: Icon, 
  bgColor, 
  textColor,
  linkTo
}: {
  title: string;
  description: string;
  count: number;
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  linkTo?: string;
}) => {
  const content = (
    <Card className="overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 ${bgColor}`} />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold">{count}</span>
          <Icon className={`h-8 w-8 ${textColor}`} />
        </div>
      </CardContent>
      {linkTo && (
        <CardFooter className="pt-0">
          <Link 
            to={linkTo} 
            className="text-sm text-muted-foreground flex items-center hover:text-foreground transition-colors"
          >
            View Details <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </CardFooter>
      )}
    </Card>
  );

  if (linkTo) {
    return content;
  }

  return content;
};

const TaskDashboardSummary = () => {
  const tasksDueToday = getTasksDueToday();
  const tasksCompletedToday = getTasksCompletedToday();
  const overdueTasks = getOverdueTasks();
  const tasksCompletedThisMonth = getTasksCompletedThisMonth();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <TaskSummaryCard
        title="Due Today"
        description="Tasks due for completion today"
        count={tasksDueToday.length}
        icon={CalendarClock}
        bgColor="bg-blue-500"
        textColor="text-blue-500"
        linkTo="/tasks/my-tasks?dueToday=true"
      />
      <TaskSummaryCard
        title="Completed Today"
        description="Tasks completed today"
        count={tasksCompletedToday.length}
        icon={CheckCircle}
        bgColor="bg-green-500"
        textColor="text-green-500"
      />
      <TaskSummaryCard
        title="Overdue"
        description="Tasks past their due date"
        count={overdueTasks.length}
        icon={AlertTriangle}
        bgColor="bg-red-500"
        textColor="text-red-500"
        linkTo="/tasks/my-tasks?overdue=true"
      />
      <TaskSummaryCard
        title="Monthly Completed"
        description="Tasks completed this month"
        count={tasksCompletedThisMonth.length}
        icon={CalendarCheck}
        bgColor="bg-purple-500"
        textColor="text-purple-500"
      />
    </div>
  );
};

export default TaskDashboardSummary;
