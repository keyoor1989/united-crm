
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  location: string;
  setLocation: (location: string) => void;
  jobType: string;
  setJobType: (jobType: string) => void;
  jobPriority: string;
  setJobPriority: (priority: string) => void;
  engineerFilter: string;
  setEngineerFilter: (engineer: string) => void;
  showFilters: boolean;
}

export const DashboardFilters = ({
  dateRange,
  onDateRangeChange,
  location,
  setLocation,
  jobType,
  setJobType,
  jobPriority,
  setJobPriority,
  engineerFilter,
  setEngineerFilter,
  showFilters,
}: DashboardFiltersProps) => {
  if (!showFilters) return null;
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date-range">Date Range</Label>
            <DateRangePicker dateRange={dateRange} onDateRangeChange={onDateRangeChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Office Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Locations">All Locations</SelectItem>
                <SelectItem value="Indore">Indore</SelectItem>
                <SelectItem value="Bhopal">Bhopal</SelectItem>
                <SelectItem value="Jabalpur">Jabalpur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-type">Job Type</Label>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger id="job-type">
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                <SelectItem value="AMC">AMC</SelectItem>
                <SelectItem value="Warranty">Warranty</SelectItem>
                <SelectItem value="Rental">Rental</SelectItem>
                <SelectItem value="Out of Warranty">Out of Warranty</SelectItem>
                <SelectItem value="Paid Call">Paid Call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Job Priority</Label>
            <Select value={jobPriority} onValueChange={setJobPriority}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Priorities">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="engineer">Engineer</Label>
            <Select value={engineerFilter} onValueChange={setEngineerFilter}>
              <SelectTrigger id="engineer">
                <SelectValue placeholder="Select engineer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Engineers">All Engineers</SelectItem>
                <SelectItem value="Rahul Sharma">Rahul Sharma</SelectItem>
                <SelectItem value="Ankit Patel">Ankit Patel</SelectItem>
                <SelectItem value="Sunil Verma">Sunil Verma</SelectItem>
                <SelectItem value="Vikram Singh">Vikram Singh</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
