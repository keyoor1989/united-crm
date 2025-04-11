
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockServiceCalls } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface RecentServiceCallsProps {
  className?: string;
}

const RecentServiceCalls: React.FC<RecentServiceCallsProps> = ({ className }) => {
  // Get the 5 most recent service calls
  const recentCalls = [...mockServiceCalls]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Recent Service Calls</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          asChild
        >
          <Link to="/service">
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentCalls.map((call) => (
            <div key={call.id} className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{call.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {call.issueType} - {call.machineModel}
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
                  {new Date(call.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentServiceCalls;
