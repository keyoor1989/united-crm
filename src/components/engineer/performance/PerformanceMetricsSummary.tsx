
import React from "react";
import { PerformanceSummaryCard } from "@/components/engineer/PerformanceSummaryCard";
import { FileText, CheckCircle2, Clock, XCircle, AlertTriangle, Star } from "lucide-react";

export const PerformanceMetricsSummary = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <PerformanceSummaryCard 
        title="Total Jobs Assigned"
        value="124"
        icon={<FileText className="h-4 w-4" />}
        trend={{ value: 8, isPositive: true }}
      />
      <PerformanceSummaryCard 
        title="Jobs Completed"
        value="98"
        icon={<CheckCircle2 className="h-4 w-4" />}
        trend={{ value: 12, isPositive: true }}
      />
      <PerformanceSummaryCard 
        title="Avg Time to Complete"
        value="4.2h"
        icon={<Clock className="h-4 w-4" />}
        trend={{ value: 0.3, isPositive: true }}
      />
      <PerformanceSummaryCard 
        title="SLA Breaches"
        value="7"
        icon={<XCircle className="h-4 w-4" />}
        trend={{ value: 2, isPositive: false }}
      />
      <PerformanceSummaryCard 
        title="Jobs Delayed"
        value="14"
        icon={<AlertTriangle className="h-4 w-4" />}
        trend={{ value: 1, isPositive: false }}
      />
      <PerformanceSummaryCard 
        title="Avg Customer Rating"
        value="4.2"
        icon={<Star className="h-4 w-4" />}
        trend={{ value: 0.3, isPositive: true }}
      />
    </div>
  );
};
