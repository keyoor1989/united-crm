
import React from "react";
import { CalendarDays, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TaskDepartment, TaskPriority, TaskStatus } from "@/types/task";

interface TaskFiltersProps {
  statusFilter: TaskStatus | "All";
  setStatusFilter: (status: TaskStatus | "All") => void;
  priorityFilter: TaskPriority | "All";
  setPriorityFilter: (priority: TaskPriority | "All") => void;
  departmentFilter: TaskDepartment | "All";
  setDepartmentFilter: (department: TaskDepartment | "All") => void;
  showDueToday: boolean;
  setShowDueToday: (show: boolean) => void;
  showOverdue: boolean;
  setShowOverdue: (show: boolean) => void;
  onClearFilters: () => void;
  onViewCalendar?: () => void;
  showCalendarView?: boolean;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  departmentFilter,
  setDepartmentFilter,
  showDueToday,
  setShowDueToday,
  showOverdue,
  setShowOverdue,
  onClearFilters,
  onViewCalendar,
  showCalendarView,
}) => {
  return (
    <div className="bg-muted/40 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filter Tasks
        </h3>
        <div className="flex gap-2">
          {onViewCalendar && (
            <Button 
              variant={showCalendarView ? "default" : "outline"} 
              size="sm"
              onClick={onViewCalendar}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendar View
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="status-filter">Status</Label>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as TaskStatus | "All")}
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Missed">Missed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority-filter">Priority</Label>
          <Select
            value={priorityFilter}
            onValueChange={(value) => setPriorityFilter(value as TaskPriority | "All")}
          >
            <SelectTrigger id="priority-filter">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Priorities</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="department-filter">Department</Label>
          <Select
            value={departmentFilter}
            onValueChange={(value) => setDepartmentFilter(value as TaskDepartment | "All")}
          >
            <SelectTrigger id="department-filter">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Departments</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Service">Service</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Inventory">Inventory</SelectItem>
              <SelectItem value="Rental">Rental</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 mt-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="due-today"
            checked={showDueToday}
            onCheckedChange={(checked) => setShowDueToday(checked === true)}
          />
          <Label htmlFor="due-today">Due Today</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="overdue"
            checked={showOverdue}
            onCheckedChange={(checked) => setShowOverdue(checked === true)}
          />
          <Label htmlFor="overdue">Show Overdue</Label>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
