
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceCall, Engineer } from "@/types/service";
import { ServiceCallsList } from "./ServiceCallsList";

interface ServiceCallTabsProps {
  pendingCalls: ServiceCall[];
  inProgressCalls: ServiceCall[];
  completedCalls: ServiceCall[];
  allCalls: ServiceCall[];
  engineers: Engineer[];
  onShowDetails: (serviceCall: ServiceCall) => void;
  onAssignEngineer: (serviceCallId: string, engineerId: string) => void;
  onReassignCall: (serviceCallId: string) => void;
  onFilterChange?: (filter: string) => void;
}

export const ServiceCallTabs: React.FC<ServiceCallTabsProps> = ({
  pendingCalls,
  inProgressCalls,
  completedCalls,
  allCalls,
  engineers,
  onShowDetails,
  onAssignEngineer,
  onReassignCall,
  onFilterChange,
}) => {
  return (
    <Tabs defaultValue="pending">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            <Badge className="ml-1 bg-amber-500">{pendingCalls.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inProgress">
            In Progress
            <Badge className="ml-1 bg-blue-500">{inProgressCalls.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            <Badge className="ml-1 bg-green-500">{completedCalls.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Today
          </Button>
          <Button variant="outline" size="sm">
            This Week
          </Button>
          <Button variant="outline" size="sm">
            This Month
          </Button>
        </div>
      </div>

      <TabsContent value="pending" className="mt-4">
        <ServiceCallsList 
          calls={pendingCalls} 
          engineers={engineers}
          onShowDetails={onShowDetails}
          onAssignEngineer={onAssignEngineer}
          onReassignCall={onReassignCall}
        />
      </TabsContent>

      <TabsContent value="inProgress" className="mt-4">
        <ServiceCallsList 
          calls={inProgressCalls} 
          engineers={engineers}
          onShowDetails={onShowDetails}
          onAssignEngineer={onAssignEngineer}
          onReassignCall={onReassignCall}
        />
      </TabsContent>
      
      <TabsContent value="completed" className="mt-4">
        <ServiceCallsList 
          calls={completedCalls} 
          engineers={engineers}
          onShowDetails={onShowDetails}
          onAssignEngineer={onAssignEngineer}
          onReassignCall={onReassignCall}
        />
      </TabsContent>
      
      <TabsContent value="all" className="mt-4">
        <ServiceCallsList 
          calls={allCalls} 
          engineers={engineers}
          onShowDetails={onShowDetails}
          onAssignEngineer={onAssignEngineer}
          onReassignCall={onReassignCall}
        />
      </TabsContent>
    </Tabs>
  );
};
