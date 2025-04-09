
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Sample data for category distribution
const categoryData = [
  {
    name: 'Toners',
    Indore: 45,
    Bhopal: 28,
    Jabalpur: 17,
  },
  {
    name: 'Drums',
    Indore: 32,
    Bhopal: 14,
    Jabalpur: 8,
  },
  {
    name: 'Machines',
    Indore: 15,
    Bhopal: 5,
    Jabalpur: 3,
  },
  {
    name: 'Spare Parts',
    Indore: 38,
    Bhopal: 18,
    Jabalpur: 11,
  },
];

const InventoryOverview = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Distribution</CardTitle>
        <CardDescription>
          Product categories across all locations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
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
              <Bar dataKey="Indore" stackId="a" fill="#3b82f6" name="Indore (HQ)" />
              <Bar dataKey="Bhopal" stackId="a" fill="#10b981" name="Bhopal Office" />
              <Bar dataKey="Jabalpur" stackId="a" fill="#8b5cf6" name="Jabalpur Office" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryOverview;
