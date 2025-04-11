
import React, { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import { mockTasks, currentUser } from "@/data/taskData";
import MyTasksTab from "./MyTasksTab";
import AssignTaskTab from "./AssignTaskTab";

const TaskDashboard = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  
  // Filter tasks for the current user
  const myTasks = tasks.filter(task => task.assignedTo.id === currentUser.id);
  
  // Filter tasks created by the current user
  const tasksCreatedByMe = tasks.filter(task => task.createdBy.id === currentUser.id);

  const handleCreateTask = (taskData: Partial<Task>) => {
    const newTask = taskData as Task;
    setTasks(prev => [newTask, ...prev]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => 
      prev.map(task => task.id === updatedTask.id ? updatedTask : task)
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

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
                  onTaskUpdate={handleUpdateTask} 
                  onTaskDelete={handleDeleteTask} 
                />
              </TabsContent>
              <TabsContent value="assign-tasks" className="mt-0">
                <AssignTaskTab 
                  tasks={tasksCreatedByMe} 
                  onTaskUpdate={handleUpdateTask} 
                  onTaskDelete={handleDeleteTask} 
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
