
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Star, Clock } from "lucide-react";

export const AttentionRecommendations = () => {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Engineers Requiring Attention</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-red-50 p-3 rounded-md border border-red-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Rahul Sharma has 3 SLA breaches in the last 7 days</p>
              <p className="text-sm text-red-700">Recommend: Performance review and additional training</p>
            </div>
          </div>
          
          <div className="bg-amber-50 p-3 rounded-md border border-amber-200 flex items-start gap-3">
            <Star className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Sunil Verma has below average customer rating (3.2 stars)</p>
              <p className="text-sm text-amber-700">Recommend: Customer service training</p>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Sunil Verma has highest average job completion time (5.1h)</p>
              <p className="text-sm text-blue-700">Recommend: Process efficiency training</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
