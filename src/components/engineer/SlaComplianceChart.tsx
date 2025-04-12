
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Rahul S.",
    met: 31,
    breached: 3,
  },
  {
    name: "Ankit P.",
    met: 37,
    breached: 1,
  },
  {
    name: "Sunil V.",
    met: 19,
    breached: 2,
  },
  {
    name: "Vikram S.",
    met: 18,
    breached: 0,
  },
  {
    name: "Deepak M.",
    met: 27,
    breached: 1,
  },
];

interface SlaComplianceChartProps {
  engineerId: string;
  dateRange: {
    from: Date;
    to: Date;
  };
}

export const SlaComplianceChart: React.FC<SlaComplianceChartProps> = ({ engineerId, dateRange }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
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
          <Bar dataKey="met" stackId="a" fill="#82ca9d" name="SLA Met" />
          <Bar dataKey="breached" stackId="a" fill="#ff8042" name="SLA Breached" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
