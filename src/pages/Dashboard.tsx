import React from "react";
import { Link } from "react-router-dom";
import StatCard from "@/components/dashboard/StatCard";
import { 
  Users, 
  ArrowUpRight, 
  CircleDollarSign, 
  ClipboardList, 
  BarChart3,
  Bot,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RecentServiceCalls from "@/components/dashboard/RecentServiceCalls";
import UpcomingTasks from "@/components/dashboard/UpcomingTasks";
import RevenueChart from "@/components/dashboard/RevenueChart";
import TopCustomers from "@/components/dashboard/TopCustomers";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business metrics and activities
          </p>
        </div>
      </div>

      {/* Add Chat Assistant Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="p-4 hover:bg-accent/50 transition-colors border-border">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Bot Assistant</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Get help with daily tasks and simple business queries
            </p>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link to="/chat">
                Open Bot Assistant
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
        
        <Card className="p-4 hover:bg-accent/50 transition-colors border-border">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Bot className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Smart Chat Assistant</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Use natural language commands to automate tasks and get business insights
            </p>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link to="/chat-assistant">
                Open Smart Assistant
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Stats Grid - Keep existing dashboard content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value="2,543"
          description="+180 from last month"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Monthly Revenue"
          value="₹4.3L"
          description="+7% from last month"
          icon={<CircleDollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Active Service Calls"
          value="18"
          description="6 pending resolution"
          icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="AMC Renewals"
          value="8"
          description="Due this month"
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RecentServiceCalls className="md:col-span-2 lg:col-span-1" />
        <UpcomingTasks className="md:col-span-2 lg:col-span-1" />
        <TopCustomers className="md:col-span-2 lg:col-span-1" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RevenueChart />
      </div>
    </div>
  );
};

export default Dashboard;
