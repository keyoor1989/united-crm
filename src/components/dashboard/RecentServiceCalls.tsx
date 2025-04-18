
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentServiceCallsProps {
  className?: string;
}

export const RecentServiceCalls: React.FC<RecentServiceCallsProps> = ({ className }) => {
  const { data: recentCalls, isLoading } = useQuery({
    queryKey: ['recentServiceCalls'],
    queryFn: async () => {
      const { data } = await supabase
        .from('service_calls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    }
  });

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Recent Service Calls</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
          <Link to="/service">
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {recentCalls?.map((call) => (
              <div key={call.id} className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{call.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {call.issue_type} - {call.machine_model}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span 
                    className={`px-2 py-1 text-xs rounded-full ${
                      call.status === "Pending" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : call.status === "In Progress" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {call.status}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(call.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Add a default export
export default RecentServiceCalls;
