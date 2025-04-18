
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskDashboardSummary from "@/components/tasks/TaskDashboardSummary";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/types/task";
import MyTasksTab from "./MyTasksTab";
import AssignTaskTab from "./AssignTaskTab";
import { useTaskContext } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";

const TaskDashboard = () => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { tasks, myTasks, loading, updateTask, deleteTask, addTask } = useTaskContext();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Redirect to login if user is not authenticated and not in loading state
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Don't render anything while authentication is in progress
  if (authLoading) {
    return (
      <div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Spinner className="h-8 w-8 mb-4" />
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  // If not authenticated and not loading, don't render dashboard (should redirect)
  if (!isAuthenticated && !authLoading) {
    return null;
  }

  // Filter tasks created by the current user (this is handled by RLS in Supabase)
  const tasksCreatedByMe = tasks;

  const handleCreateTask = async (taskData: Partial<Task>) => {
    await addTask(taskData);
    setIsCreateDialogOpen(false);
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Spinner className="h-8 w-8 mb-4" />
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <TaskDashboardSummary />

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="my-tasks" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger 
                value="my-tasks" 
                className="rounded-none border-b-2 border-transparent py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                My Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="assign-tasks" 
                className="rounded-none border-b-2 border-transparent py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Assign Tasks
              </TabsTrigger>
            </TabsList>
            <div className="p-6">
              <TabsContent value="my-tasks" className="mt-0">
                <MyTasksTab 
                  tasks={myTasks} 
                  onTaskUpdate={updateTask} 
                  onTaskDelete={deleteTask} 
                />
              </TabsContent>
              <TabsContent value="assign-tasks" className="mt-0">
                <AssignTaskTab 
                  tasks={tasksCreatedByMe} 
                  onTaskUpdate={updateTask} 
                  onTaskDelete={deleteTask} 
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <TaskFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export default TaskDashboard;
