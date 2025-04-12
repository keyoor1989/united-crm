
import React from "react";
import { ServiceCallCard } from "@/components/service/ServiceCallCard";
import { ServiceCall, Engineer } from "@/types/service";

interface ServiceCallsListProps {
  calls: ServiceCall[];
  engineers: Engineer[];
  onShowDetails: (serviceCall: ServiceCall) => void;
  onAssignEngineer: (serviceCallId: string, engineerId: string) => void;
  onReassignCall: (serviceCallId: string) => void;
}

export const ServiceCallsList: React.FC<ServiceCallsListProps> = ({
  calls,
  engineers,
  onShowDetails,
  onAssignEngineer,
  onReassignCall,
}) => {
  if (calls.length === 0) {
    return (
      <div className="col-span-full text-center py-8 text-muted-foreground">
        No service calls found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {calls.map((call) => (
        <ServiceCallCard
          key={call.id}
          serviceCall={call}
          engineers={engineers}
          onShowDetails={() => onShowDetails(call)}
          onAssign={onAssignEngineer}
          onReassign={onReassignCall}
        />
      ))}
    </div>
  );
};
