
import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, Legend 
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import CompletionTimeChart from "@/components/engineer/CompletionTimeChart";
import SlaComplianceChart from "@/components/engineer/SlaComplianceChart";
import JobTypeDistributionChart from "@/components/engineer/JobTypeDistributionChart";
import EngineerJobsChart from "@/components/engineer/EngineerJobsChart";
import { Badge } from "@/components/ui/badge";
import { Engineer, EngineerStatus, EngineerSkillLevel } from "@/types/service";
import { supabase } from "@/integrations/supabase/client";

export default function EngineerServiceReport() {
  const [selectedEngineer, setSelectedEngineer] = useState<string>("no-selection");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const { data, error } = await supabase
        .from('engineers')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching engineers:", error);
        return;
      }
      
      const transformedEngineers: Engineer[] = data.map(eng => {
        return {
          id: eng.id || `eng-${Math.random().toString(36).substring(2, 9)}`, // Ensure ID is never empty
          name: eng.name,
          phone: eng.phone,
          email: eng.email,
          location: eng.location,
          status: eng.status as EngineerStatus,
          skillLevel: eng.skill_level as EngineerSkillLevel,
          currentJob: eng.current_job,
          currentLocation: eng.current_location,
          // Type assertion to handle leave_end_date
          leaveEndDate: (eng as any).leave_end_date || undefined
        };
      });
      
      setEngineers(transformedEngineers);
      setIsLoading(false);
      
      if (transformedEngineers.length > 0) {
        setSelectedEngineer(transformedEngineers[0].id);
      }
    } catch (err) {
      console.error("Unexpected error fetching engineers:", err);
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Engineer Service Report</CardTitle>
          <CardDescription>
            Analyze service performance by engineer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Engineer Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Engineer</h3>
              <Select value={selectedEngineer} onValueChange={setSelectedEngineer}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an engineer" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading">Loading...</SelectItem>
                  ) : engineers.length > 0 ? (
                    engineers.map((engineer) => (
                      <SelectItem key={engineer.id} value={engineer.id}>
                        {engineer.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-engineers">No engineers found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Picker */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Date Range</h3>
              <DateRangePicker dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
            </div>

            {/* Display Selected Date Range */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Selected Range</h3>
              <Badge variant="secondary">
                {dateRange.from && dateRange.to
                  ? `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
                  : 'Select a date range'}
              </Badge>
            </div>
          </div>

          {/* Charts and Data Visualization */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CompletionTimeChart engineerId={selectedEngineer} dateRange={dateRange} />
            <SlaComplianceChart engineerId={selectedEngineer} dateRange={dateRange} />
            <JobTypeDistributionChart engineerId={selectedEngineer} dateRange={dateRange} />
            <EngineerJobsChart engineerId={selectedEngineer} dateRange={dateRange} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
