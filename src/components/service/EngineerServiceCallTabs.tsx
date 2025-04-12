
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCall } from "@/types/service";
import { DetailedServiceCallCard } from "./DetailedServiceCallCard";

interface EngineerServiceCallTabsProps {
  serviceCalls: ServiceCall[];
}

export const EngineerServiceCallTabs: React.FC<EngineerServiceCallTabsProps> = ({ 
  serviceCalls 
}) => {
  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="active">Active Calls</TabsTrigger>
        <TabsTrigger value="completed">Completed Calls</TabsTrigger>
        <TabsTrigger value="all">All Calls</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-4 mt-4">
        {serviceCalls.filter(call => call.status !== "Completed").length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">
            No active service calls found for this engineer.
          </p>
        ) : (
          serviceCalls
            .filter(call => call.status !== "Completed")
            .map(call => (
              <DetailedServiceCallCard key={call.id} call={call} />
            ))
        )}
      </TabsContent>

      <TabsContent value="completed" className="space-y-4 mt-4">
        {serviceCalls.filter(call => call.status === "Completed").length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">
            No completed service calls found for this engineer.
          </p>
        ) : (
          serviceCalls
            .filter(call => call.status === "Completed")
            .map(call => (
              <DetailedServiceCallCard key={call.id} call={call} />
            ))
        )}
      </TabsContent>

      <TabsContent value="all" className="space-y-4 mt-4">
        {serviceCalls.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">
            No service calls found for this engineer.
          </p>
        ) : (
          serviceCalls.map(call => <DetailedServiceCallCard key={call.id} call={call} />)
        )}
      </TabsContent>
    </Tabs>
  );
};
