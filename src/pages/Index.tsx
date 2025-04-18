import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Only redirect when authentication check is complete
    if (!isLoading) {
      console.log("Index: Auth state determined - Authenticated:", isAuthenticated);
      
      if (isAuthenticated) {
        console.log("Index: User is authenticated, staying on dashboard");
      } else {
        console.log("Index: Not authenticated, redirecting to login");
        navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Loading authentication status...</span>
      </div>
    );
  }

  // If authenticated, render the dashboard content
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
          value="2,543"
          description="+180 from last month"
          icon={statsIcons.customers}
        />
        <StatCard
          title="Monthly Revenue"
          value="₹4.3L"
          description="+7% from last month"
          icon={statsIcons.revenue}
        />
        <StatCard
          title="Active Service Calls"
          value="18"
          description="6 pending resolution"
          icon={statsIcons.serviceCall}
        />
        <StatCard
          title="AMC Renewals"
          value="8"
          description="Due this month"
          icon={statsIcons.renewals}
        />
      </div>

      {/* Task Summary Section */}
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
