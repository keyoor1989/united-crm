
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import PartsReconciliationTable from "@/components/service/PartsReconciliationTable";
import { ServiceCall } from "@/types/service";

interface PartsReconciliationTabProps {
  serviceCalls: ServiceCall[];
  onReconcile: (serviceCallId: string, reconciled: boolean) => void;
  onPartReconcile: (serviceCallId: string, partId: string, reconciled: boolean) => void;
  isLoading: boolean;
}

const PartsReconciliationTab = ({ 
  serviceCalls, 
  onReconcile, 
  onPartReconcile, 
  isLoading 
}: PartsReconciliationTabProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading reconciliation data...</p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-6">
        <PartsReconciliationTable 
          serviceCalls={serviceCalls}
          onReconcile={onReconcile}
          onPartReconcile={onPartReconcile}
        />
      </CardContent>
    </Card>
  );
};

export default PartsReconciliationTab;
