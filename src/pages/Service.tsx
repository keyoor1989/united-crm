import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";
import { ServiceCall, Engineer } from "@/types/service";
import { ServiceSearchBar } from "@/components/service/ServiceSearchBar";
import { ServiceCallTabs } from "@/components/service/ServiceCallTabs";
import { EngineerLocations } from "@/components/service/EngineerLocations";
import ServiceDetailDialog from "@/components/service/ServiceDetailDialog";
import { useServiceData } from "@/hooks/useServiceData";
import { useServiceActions } from "@/components/service/ServiceActions";

const Service = () => {
  const {
    serviceCalls,
    engineers,
    searchTerm,
    selectedServiceCall,
    showDetailDialog,
    pendingCalls,
    inProgressCalls,
    completedCalls,
    allCalls,
    setSearchTerm,
    handleShowDetails,
    handleDialogClose,
    handleRefresh,
    fetchServiceCalls
  } = useServiceData();
  
  const [serviceCallsState, setServiceCallsState] = useState<ServiceCall[]>([]);
  const [engineersState, setEngineersState] = useState<Engineer[]>([]);
  
  React.useEffect(() => {
    setServiceCallsState(serviceCalls);
  }, [serviceCalls]);
  
  React.useEffect(() => {
    setEngineersState(engineers);
  }, [engineers]);
  
  const {
    handleAssignEngineer,
    handleReassignCall,
    handleEngineerCardClick
  } = useServiceActions(
    serviceCallsState, 
    setServiceCallsState, 
    engineersState, 
    setEngineersState
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Management</h1>
          <p className="text-muted-foreground">
            Track and manage service calls and engineer activities
          </p>
        </div>
        <Link to="/service-call-form">
          <Button className="gap-1 bg-brand-500 hover:bg-brand-600">
            <CalendarCheck className="h-4 w-4" />
            Create Service Call
          </Button>
        </Link>
      </div>

      <ServiceSearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={handleRefresh}
      />

      <ServiceCallTabs
        pendingCalls={pendingCalls}
        inProgressCalls={inProgressCalls}
        completedCalls={completedCalls}
        allCalls={allCalls}
        engineers={engineers}
        onShowDetails={handleShowDetails}
        onAssignEngineer={handleAssignEngineer}
        onReassignCall={handleReassignCall}
      />
      
      <EngineerLocations 
        engineers={engineers}
        onEngineerClick={handleEngineerCardClick}
      />

      <ServiceDetailDialog
        showDialog={showDetailDialog}
        serviceCall={selectedServiceCall}
        onClose={handleDialogClose}
        onUpdate={fetchServiceCalls}
        engineers={engineers}
      />
    </div>
  );
};

export default Service;
