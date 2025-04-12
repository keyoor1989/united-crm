
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ServiceCall, Engineer } from "@/types/service";
import { mockServiceCalls, mockEngineers } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { ServiceCallDetail } from "@/components/service/ServiceCallDetail";
import { ServiceSearchBar } from "@/components/service/ServiceSearchBar";
import { ServiceCallTabs } from "@/components/service/ServiceCallTabs";
import { EngineerLocations } from "@/components/service/EngineerLocations";

const Service = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>(mockServiceCalls);
  const [engineers, setEngineers] = useState<Engineer[]>(mockEngineers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceCall, setSelectedServiceCall] = useState<ServiceCall | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  const filterCalls = (status: string) => {
    if (status === "all") {
      return serviceCalls.filter(call => 
        call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return serviceCalls.filter(call => 
      call.status.toLowerCase() === status.toLowerCase() && 
      (call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       call.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
       call.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };
  
  const pendingCalls = filterCalls("pending");
  const inProgressCalls = filterCalls("in progress");
  const completedCalls = filterCalls("completed");
  const allCalls = filterCalls("all");
  
  const handleShowDetails = (serviceCall: ServiceCall) => {
    setSelectedServiceCall(serviceCall);
    setShowDetailDialog(true);
  };
  
  const handleAssignEngineer = (serviceCallId: string, engineerId: string) => {
    const updatedCalls = serviceCalls.map(call => {
      if (call.id === serviceCallId) {
        const assignedEngineer = engineers.find(e => e.id === engineerId);
        return {
          ...call,
          engineerId,
          engineerName: assignedEngineer?.name || "",
          status: "Pending"
        };
      }
      return call;
    });
    
    const updatedEngineers = engineers.map(eng => {
      if (eng.id === engineerId) {
        const serviceCall = serviceCalls.find(call => call.id === serviceCallId);
        return {
          ...eng,
          status: "On Call",
          currentJob: `Service Call #${serviceCallId}`,
          currentLocation: serviceCall?.location || eng.location
        };
      }
      return eng;
    });
    
    setServiceCalls(updatedCalls);
    setEngineers(updatedEngineers);
    
    toast({
      title: "Engineer Assigned",
      description: "The service call has been assigned to the engineer",
    });
  };
  
  const handleReassignCall = (serviceCallId: string) => {
    toast({
      title: "Reassignment",
      description: "Engineer reassignment feature coming soon",
    });
  };
  
  const handleEngineerCardClick = (engineerId: string) => {
    navigate(`/engineer/${engineerId}`);
  };

  const handleRefresh = () => {
    // This would typically fetch fresh data from the API
    // For now we just reset the search term
  };

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

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl">
          {selectedServiceCall && (
            <ServiceCallDetail 
              serviceCall={selectedServiceCall} 
              onClose={() => setShowDetailDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Service;
