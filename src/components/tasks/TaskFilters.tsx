
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, ListFilter, X } from "lucide-react";
import { TaskDepartment, TaskPriority, TaskStatus } from "@/types/task";

interface TaskFiltersProps {
  statusFilter: TaskStatus | "All";
  setStatusFilter: (value: TaskStatus | "All") => void;
  priorityFilter: TaskPriority | "All";
  setPriorityFilter: (value: TaskPriority | "All") => void;
  departmentFilter: TaskDepartment | "All";
  setDepartmentFilter: (value: TaskDepartment | "All") => void;
  showDueToday: boolean;
  setShowDueToday: (value: boolean) => void;
  showOverdue: boolean;
  setShowOverdue: (value: boolean) => void;
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
  showCalendarView
}) => {
  const hasActiveFilters = 
    statusFilter !== "All" || 
    priorityFilter !== "All" || 
    departmentFilter !== "All" || 
    showDueToday || 
    showOverdue;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListFilter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="h-8 gap-1"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
          
          {onViewCalendar && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewCalendar}
              className="h-8 gap-1"
            >
              <Calendar className="h-4 w-4" />
              {showCalendarView ? "List View" : "Calendar View"}
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label htmlFor="status-filter">Status</Label>
          <Select
            value={statusFilter}
            onValueChange={(value) => 
              setStatusFilter(value as TaskStatus | "All")
            }
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
        
        <div className="space-y-1">
          <Label htmlFor="priority-filter">Priority</Label>
          <Select
            value={priorityFilter}
            onValueChange={(value) => 
              setPriorityFilter(value as TaskPriority | "All")
            }
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
        
        <div className="space-y-1">
          <Label htmlFor="department-filter">Department</Label>
          <Select
            value={departmentFilter}
            onValueChange={(value) => 
              setDepartmentFilter(value as TaskDepartment | "All")
            }
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
      
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="due-today"
            checked={showDueToday}
            onCheckedChange={setShowDueToday}
          />
          <Label htmlFor="due-today">Due Today</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="overdue"
            checked={showOverdue}
            onCheckedChange={setShowOverdue}
          />
          <Label htmlFor="overdue">Overdue Tasks</Label>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
