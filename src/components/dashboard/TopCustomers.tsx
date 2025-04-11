
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Building2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CustomerType } from "@/types/customer";

interface TopCustomersProps {
  className?: string;
}

const TopCustomers: React.FC<TopCustomersProps> = ({ className }) => {
  const [topCustomers, setTopCustomers] = useState<CustomerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, name, area, phone, email, lead_status')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) {
          console.error("Error fetching top customers:", error);
          return;
        }
        
        if (data) {
          const customers = data.map(customer => ({
            id: customer.id,
            name: customer.name,
            location: customer.area,
            phone: customer.phone,
            email: customer.email || "",
            lastContact: "Recent",
            machines: [],
            status: customer.lead_status === "Converted" ? "Active" : "Prospect" as CustomerType["status"]
          }));
          
          setTopCustomers(customers);
        }
      } catch (error) {
        console.error("Error in fetchTopCustomers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopCustomers();
  }, []);

  const getCustomerIcon = (type: string) => {
    // Determine icon based on lead_status or other properties
    return <Users className="h-4 w-4 text-purple-500" />;
  };

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
          {topCustomers.map((customer) => (
            <div key={customer.id} className="flex items-center">
              <div className="mr-2">{getCustomerIcon(customer.status)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.location}
                </p>
              </div>
              <div className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                {customer.status}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopCustomers;
