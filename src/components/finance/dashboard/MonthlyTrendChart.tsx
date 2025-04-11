
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { FinanceTrend } from "@/types/finance";

interface MonthlyTrendChartProps {
  data: FinanceTrend[];
  formatCurrency: (amount: number) => string;
}

const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data, formatCurrency }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Financial Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#0088FE" />
              <Bar dataKey="expenses" name="Expenses" fill="#FF8042" />
              <Bar dataKey="profit" name="Profit" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(MonthlyTrendChart);
