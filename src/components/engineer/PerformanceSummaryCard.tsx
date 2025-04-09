
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PerformanceSummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const PerformanceSummaryCard = ({
  title,
  value,
  icon,
  trend,
  className,
}: PerformanceSummaryCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            {icon}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <div
              className={cn(
                "text-xs font-medium flex items-center",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
              {typeof trend.value === 'number' && !Number.isInteger(trend.value) ? '' : '%'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
