
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useTaskContext } from "@/contexts/TaskContext";
import { Task } from "@/types/task";

interface UpcomingTasksProps {
  className?: string;
}

const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ className }) => {
  // Try to use the task context, but handle the case when it's not available
  let tasks: Task[] = [];
  let contextError = false;
  
  try {
    const { tasks: contextTasks } = useTaskContext();
    tasks = contextTasks;
  } catch (error) {
    console.warn("TaskContext not available in UpcomingTasks, using empty task list");
    contextError = true;
  }
  
  // Get upcoming tasks that are due in the next 7 days and not completed
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  
  const upcomingTasks = contextError ? [] : tasks
    .filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= nextWeek && task.status !== "Completed";
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Upcoming Tasks</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          asChild
        >
          <Link to="/tasks">
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming tasks for the next week</p>
            </div>
          ) : (
            upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.department} - {task.priority} priority
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span 
                    className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === "High" 
                        ? "bg-red-100 text-red-800" 
                        : task.priority === "Medium" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    Due {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingTasks;
