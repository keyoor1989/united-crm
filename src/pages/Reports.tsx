
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart2, 
  PieChart, 
  LineChart, 
  Printer, 
  BadgeDollarSign,
  BarChart3,
  Users,
  FileSpreadsheet,
  Clock
} from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();

  const reportCards = [
    {
      title: "Machine-wise Rental Report",
      description: "Performance analysis of machines under AMC/Rental contracts",
      icon: <Printer className="h-12 w-12 text-blue-500" />,
      path: "/reports/machine-rental"
    },
    {
      title: "Financial Reports",
      description: "Revenue, expenses and profit analysis",
      icon: <BadgeDollarSign className="h-12 w-12 text-green-500" />,
      path: "/finance"
    },
    {
      title: "Sales Performance",
      description: "Product-wise and region-wise sales data",
      icon: <BarChart3 className="h-12 w-12 text-purple-500" />,
      path: "/reports"
    },
    {
      title: "Customer Analysis",
      description: "Customer retention, growth and spending patterns",
      icon: <Users className="h-12 w-12 text-orange-500" />,
      path: "/reports"
    },
    {
      title: "Inventory Reports",
      description: "Stock levels, movements and valuation",
      icon: <FileSpreadsheet className="h-12 w-12 text-amber-500" />,
      path: "/inventory"
    },
    {
      title: "Service Trend Analysis",
      description: "Service calls, resolution time and customer satisfaction",
      icon: <Clock className="h-12 w-12 text-indigo-500" />,
      path: "/service"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((card, index) => (
          <Card 
            key={index} 
            className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(card.path)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              {card.icon}
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" className="w-full" onClick={() => navigate(card.path)}>
                View Report
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;
