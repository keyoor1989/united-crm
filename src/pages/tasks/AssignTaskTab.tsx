
import React, { useState } from "react";
import { isToday, isBefore } from "date-fns";
import TaskTable from "@/components/tasks/TaskTable";
import TaskFilters from "@/components/tasks/TaskFilters";
import { Task, TaskDepartment, TaskPriority, TaskStatus } from "@/types/task";

interface AssignTaskTabProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

const AssignTaskTab: React.FC<AssignTaskTabProps> = ({ tasks, onTaskUpdate, onTaskDelete }) => {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "All">("All");
  const [departmentFilter, setDepartmentFilter] = useState<TaskDepartment | "All">("All");
  const [showDueToday, setShowDueToday] = useState(false);
  const [showOverdue, setShowOverdue] = useState(false);

  const clearFilters = () => {
    setStatusFilter("All");
    setPriorityFilter("All");
    setDepartmentFilter("All");
    setShowDueToday(false);
    setShowOverdue(false);
  };

  const filterTasks = () => {
    return tasks.filter(task => {
      // Filter by status
      if (statusFilter !== "All" && task.status !== statusFilter) {
        return false;
      }

      // Filter by priority
      if (priorityFilter !== "All" && task.priority !== priorityFilter) {
        return false;
      }

      // Filter by department
      if (departmentFilter !== "All" && task.department !== departmentFilter) {
        return false;
      }

      // Filter by due today
      if (showDueToday && !isToday(new Date(task.dueDate))) {
        return false;
      }

      // Filter by overdue
      if (showOverdue && (!isBefore(new Date(task.dueDate), new Date()) || task.status === "Completed")) {
        return false;
      }

      return true;
    });
  };

  const filteredTasks = filterTasks();

  return (
    <div>
      <TaskFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        showDueToday={showDueToday}
        setShowDueToday={setShowDueToday}
        showOverdue={showOverdue}
        setShowOverdue={setShowOverdue}
        onClearFilters={clearFilters}
      />

      <TaskTable 
        tasks={filteredTasks} 
        onTaskUpdate={onTaskUpdate} 
        onTaskDelete={onTaskDelete} 
      />
    </div>
  );
};

export default AssignTaskTab;
