
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
  const { isAuthenticated, isLoading, user } = useAuth();

  // Enforce authentication check
  useEffect(() => {
    const checkAuth = async () => {
      // Double-check session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("Index: No valid session found, redirecting to login");
        navigate("/login", { replace: true });
        return;
      }
    };
    
    if (!isLoading) {
      console.log("Index: Auth state determined - Authenticated:", isAuthenticated);
      
      if (!isAuthenticated) {
        checkAuth();
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch dashboard data
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      // First verify authentication is valid
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Authentication required");
      }
      
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
    enabled: isAuthenticated && !!user
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Loading authentication status...</span>
      </div>
    );
  }

  // Don't render anything if not authenticated - will redirect via useEffect
  if (!isAuthenticated || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Verifying authentication...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'User'}
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
  );
};

export default Index;
