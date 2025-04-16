
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import EngineerJobsChart from "@/components/engineer/EngineerJobsChart";
import JobTypeDistributionChart from "@/components/engineer/JobTypeDistributionChart";
import CompletionTimeChart from "@/components/engineer/CompletionTimeChart";
import SlaComplianceChart from "@/components/engineer/SlaComplianceChart";

interface PerformanceChartsProps {
  selectedEngineer: string;
  dateRange: DateRange;
}

export const PerformanceCharts = ({ selectedEngineer, dateRange }: PerformanceChartsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Jobs Completed per Engineer</CardTitle>
        </CardHeader>
        <CardContent>
          <EngineerJobsChart 
            engineerId={selectedEngineer} 
            dateRange={dateRange}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Job Distribution by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <JobTypeDistributionChart 
            engineerId={selectedEngineer} 
            dateRange={dateRange}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Avg Completion Time Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <CompletionTimeChart 
            engineerId={selectedEngineer} 
            dateRange={dateRange}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>SLA Met vs Breached</CardTitle>
        </CardHeader>
        <CardContent>
          <SlaComplianceChart 
            engineerId={selectedEngineer} 
            dateRange={dateRange}
          />
        </CardContent>
      </Card>
    </div>
  );
};
