
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockCustomers } from "@/data/mockData";
import { Star, Building2, Users } from "lucide-react";

interface TopCustomersProps {
  className?: string;
}

const TopCustomers: React.FC<TopCustomersProps> = ({ className }) => {
  // In a real app, this would be based on actual revenue or engagement metrics
  // For now, just take the first 5 customers as an example
  const topCustomers = mockCustomers.slice(0, 5);

  const getCustomerIcon = (type: string) => {
    switch (type) {
      case "Government":
        return <Building2 className="h-4 w-4 text-blue-500" />;
      case "Corporate":
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Star className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Top Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCustomers.map((customer) => (
            <div key={customer.id} className="flex items-center">
              <div className="mr-2">{getCustomerIcon(customer.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.location} | {customer.contractType}
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
