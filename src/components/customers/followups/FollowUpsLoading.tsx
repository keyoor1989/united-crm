
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

const FollowUpsLoading: React.FC = () => {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Follow-ups Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FollowUpsLoading;
