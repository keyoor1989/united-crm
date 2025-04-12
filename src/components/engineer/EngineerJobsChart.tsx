
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  {
    name: "Rahul S.",
    completed: 34,
    assigned: 38,
  },
  {
    name: "Ankit P.",
    completed: 38,
    assigned: 42,
  },
  {
    name: "Sunil V.",
    completed: 21,
    assigned: 26,
  },
  {
    name: "Vikram S.",
    completed: 18,
    assigned: 18,
  },
  {
    name: "Deepak M.",
    completed: 28,
    assigned: 32,
  },
];

interface EngineerJobsChartProps {
  engineerId: string;
  dateRange: {
    from: Date;
    to: Date;
  };
}

export const EngineerJobsChart: React.FC<EngineerJobsChartProps> = ({ engineerId, dateRange }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="assigned" fill="#8884d8" name="Assigned Jobs" />
          <Bar dataKey="completed" fill="#82ca9d" name="Completed Jobs" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
