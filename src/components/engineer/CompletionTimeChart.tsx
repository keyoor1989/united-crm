
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  {
    week: "Week 1",
    avgTime: 4.8,
  },
  {
    week: "Week 2",
    avgTime: 4.5,
  },
  {
    week: "Week 3",
    avgTime: 4.2,
  },
  {
    week: "Week 4",
    avgTime: 3.8,
  },
  {
    week: "Week 5",
    avgTime: 3.6,
  },
  {
    week: "Week 6",
    avgTime: 3.2,
  },
];

export interface CompletionTimeChartProps {
  engineerId: string;
  dateRange: {
    from: Date;
    to: Date;
  };
}

export const CompletionTimeChart: React.FC<CompletionTimeChartProps> = ({ engineerId, dateRange }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis 
            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} 
            domain={[0, 'dataMax + 1']}
          />
          <Tooltip formatter={(value) => [`${value} hours`, 'Avg Completion Time']} />
          <Legend />
          <Line
            type="monotone"
            dataKey="avgTime"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            name="Avg Completion Time"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompletionTimeChart;
