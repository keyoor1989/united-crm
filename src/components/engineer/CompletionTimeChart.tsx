import React from 'react';
import { DateRange } from 'react-day-picker';

interface CompletionTimeChartProps {
  engineerId: string;
  dateRange: DateRange;
}

const CompletionTimeChart: React.FC<CompletionTimeChartProps> = ({ engineerId, dateRange }) => {
  // Implementation remains the same
  return (
    <div>
      {/* Chart implementation */}
      <p>Completion time chart for engineer {engineerId}</p>
    </div>
  );
};

export { CompletionTimeChart };
