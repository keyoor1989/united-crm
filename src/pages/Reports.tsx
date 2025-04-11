
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
  Clock,
  Wrench,
  MessageSquare,
  Building,
  TrendingUp
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
      title: "Engineer-wise Service Call Report",
      description: "Track service call activity by engineer with detailed analysis",
      icon: <Wrench className="h-12 w-12 text-green-600" />,
      path: "/reports/engineer-service"
    },
    {
      title: "Customer Follow-Up Report",
      description: "Track CRM follow-up status, schedules, and lead activities",
      icon: <MessageSquare className="h-12 w-12 text-purple-600" />,
      path: "/reports/customer-followup"
    },
    {
      title: "Branch-wise Profit & Loss Report",
      description: "Revenue vs expenses per branch with profit and margin analysis",
      icon: <Building className="h-12 w-12 text-amber-500" />,
      path: "/reports/branch-profit"
    },
    {
      title: "Revenue Reports",
      description: "Detailed revenue analysis and trends",
      icon: <BadgeDollarSign className="h-12 w-12 text-green-500" />,
      path: "/finance/revenue"
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
      title: "Inventory Profit Report",
      description: "Profit analysis for inventory items and sales",
      icon: <TrendingUp className="h-12 w-12 text-amber-500" />,
      path: "/inventory/profit-report"
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
