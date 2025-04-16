
import React from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, Calendar } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";

interface SalesReportHeaderProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export const SalesReportHeader: React.FC<SalesReportHeaderProps> = ({ 
  dateRange,
  onDateRangeChange
}) => {
  const exportReport = () => {
    // Logic to export report as CSV or PDF
    // This is a placeholder for future implementation
    alert("Export functionality will be implemented in the future");
  };
  
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales Reports</h1>
        <p className="text-muted-foreground">
          Track sales performance, analyze trends and payment patterns
        </p>
      </div>
      <div className="flex gap-2">
        <DateRangePicker dateRange={dateRange} onDateRangeChange={onDateRangeChange} />
        <Button variant="outline" onClick={exportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
};
