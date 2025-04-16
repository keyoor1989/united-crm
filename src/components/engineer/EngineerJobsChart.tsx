
import React from 'react';
import { DateRange } from 'react-day-picker';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EngineerJobsChartProps {
  engineerId: string;
  dateRange: DateRange;
}

const EngineerJobsChart: React.FC<EngineerJobsChartProps> = ({ engineerId, dateRange }) => {
  // This would normally fetch data based on engineerId and dateRange
  // For now using mock data
  const data = [
    { name: 'Rahul Sharma', completed: 34, assigned: 38 },
    { name: 'Ankit Patel', completed: 38, assigned: 42 },
    { name: 'Sunil Verma', completed: 21, assigned: 26 },
    { name: 'Vikram Singh', completed: 18, assigned: 18 },
    { name: 'Priya Gupta', completed: 29, assigned: 32 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
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
        <Bar dataKey="assigned" fill="#8884d8" name="Jobs Assigned" />
        <Bar dataKey="completed" fill="#82ca9d" name="Jobs Completed" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EngineerJobsChart;
