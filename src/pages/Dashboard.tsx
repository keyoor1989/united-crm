
import React from "react";
import StatCard from "@/components/dashboard/StatCard";
import { 
  Users, 
  ArrowUpRight, 
  CircleDollarSign, 
  ClipboardList, 
  BarChart3,
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

      {/* Stats Grid */}
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
