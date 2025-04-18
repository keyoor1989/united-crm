
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import StatCard from "@/components/dashboard/StatCard";
import { statsIcons } from "@/components/dashboard/statsIcons";
import TaskDashboardSummary from "@/components/tasks/TaskDashboardSummary";
import { RecentServiceCalls } from "@/components/dashboard/RecentServiceCalls";
import { TopCustomers } from "@/components/dashboard/TopCustomers";
import UpcomingTasks from "@/components/dashboard/UpcomingTasks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Fetch dashboard data
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      // Get total customers
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Get monthly revenue from sales
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: monthlyRevenue } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('date', startOfMonth.toISOString());

      const totalRevenue = monthlyRevenue?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;

      // Get active service calls
      const { count: activeServiceCalls } = await supabase
        .from('service_calls')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Open', 'In Progress']);

      // Get AMC renewals due this month
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      
      const { count: amcRenewals } = await supabase
        .from('amc_contracts')
        .select('*', { count: 'exact', head: true })
        .lte('end_date', endOfMonth.toISOString())
        .gte('end_date', startOfMonth.toISOString());

      return {
        customersCount: customersCount || 0,
        monthlyRevenue: totalRevenue,
        activeServiceCalls: activeServiceCalls || 0,
        amcRenewals: amcRenewals || 0
      };
    },
    enabled: isAuthenticated
  });

  useEffect(() => {
    if (!isLoading) {
      console.log("Index: Auth state determined - Authenticated:", isAuthenticated);
      
      if (!isAuthenticated) {
        console.log("Index: Not authenticated, redirecting to login");
        navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Loading authentication status...</span>
      </div>
    );
  }

  return isAuthenticated ? (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business metrics and activities
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={dashboardStats?.customersCount.toString() || "0"}
          description="Active customer base"
          icon={statsIcons.customers}
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${((dashboardStats?.monthlyRevenue || 0) / 1000).toFixed(1)}K`}
          description="This month's revenue"
          icon={statsIcons.revenue}
        />
        <StatCard
          title="Active Service Calls"
          value={dashboardStats?.activeServiceCalls.toString() || "0"}
          description="Ongoing service requests"
          icon={statsIcons.serviceCall}
        />
        <StatCard
          title="AMC Renewals"
          value={dashboardStats?.amcRenewals.toString() || "0"}
          description="Due this month"
          icon={statsIcons.renewals}
        />
      </div>

      <TaskDashboardSummary />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RecentServiceCalls className="md:col-span-2 lg:col-span-1" />
        <UpcomingTasks className="md:col-span-2 lg:col-span-1" />
        <TopCustomers className="md:col-span-2 lg:col-span-1" />
      </div>
    </div>
  ) : null;
};

export default Index;
