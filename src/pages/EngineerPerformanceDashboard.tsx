import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Filter,
  ChevronDown,
  Mail,
  Trophy
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { DashboardFilters } from "@/components/engineer/performance/DashboardFilters";
import { PerformanceMetricsSummary } from "@/components/engineer/performance/PerformanceMetricsSummary";
import { PerformanceCharts } from "@/components/engineer/performance/PerformanceCharts";
import { EngineerPerformanceTable } from "@/components/engineer/performance/EngineerPerformanceTable";
import { AttentionRecommendations } from "@/components/engineer/performance/AttentionRecommendations";
import { EngineerLeaderboard } from "@/components/engineer/EngineerLeaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EngineerPerformanceDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedEngineer, setSelectedEngineer] = useState("all");
  const [location, setLocation] = useState("All Locations");
  const [jobType, setJobType] = useState("All Types");
  const [jobPriority, setJobPriority] = useState("All Priorities");
  const [engineerFilter, setEngineerFilter] = useState("All Engineers");
  const [showFilters, setShowFilters] = useState(false);
  
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Engineer Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and analyze service engineer performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          <Button className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            Email Report
          </Button>
        </div>
      </div>

      <DashboardFilters 
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        location={location}
        setLocation={setLocation}
        jobType={jobType}
        setJobType={setJobType}
        jobPriority={jobPriority}
        setJobPriority={setJobPriority}
        engineerFilter={engineerFilter}
        setEngineerFilter={setEngineerFilter}
        showFilters={showFilters}
      />

      <PerformanceMetricsSummary />

      <PerformanceCharts 
        selectedEngineer={selectedEngineer} 
        dateRange={dateRange} 
      />

      <EngineerPerformanceTable />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <AttentionRecommendations />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EngineerLeaderboard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EngineerPerformanceDashboard;
