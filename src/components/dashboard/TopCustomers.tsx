
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface TopCustomersProps {
  className?: string;
}

export const TopCustomers: React.FC<TopCustomersProps> = ({ className }) => {
  const { data: topCustomers, isLoading } = useQuery({
    queryKey: ['topCustomers'],
    queryFn: async () => {
      const { data } = await supabase
        .from('customers')
        .select('id, name, area, phone, email, lead_status')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center animate-pulse">
                <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="rounded-full bg-gray-200 h-5 w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Top Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCustomers?.map((customer) => (
            <div key={customer.id} className="flex items-center">
              <div className="mr-2">
                <Users className="h-4 w-4 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.area}
                </p>
              </div>
              <div className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                {customer.lead_status}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Add a default export
export default TopCustomers;
