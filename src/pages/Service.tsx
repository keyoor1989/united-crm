
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ServiceCall, Engineer, Part, Feedback } from "@/types/service";
import { useToast } from "@/hooks/use-toast";
import ServiceCallDetail from "@/components/service/ServiceCallDetail";
import { ServiceSearchBar } from "@/components/service/ServiceSearchBar";
import { ServiceCallTabs } from "@/components/service/ServiceCallTabs";
import { EngineerLocations } from "@/components/service/EngineerLocations";
import { supabase } from "@/integrations/supabase/client";

const Service = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceCall, setSelectedServiceCall] = useState<ServiceCall | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchServiceCalls();
    fetchEngineers();
  }, []);
  
  const fetchEngineers = async () => {
    try {
      const { data, error } = await supabase
        .from('engineers')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching engineers:", error);
        toast({
          title: "Error",
          description: "Failed to load engineers",
          variant: "destructive",
        });
        return;
      }
      
      const transformedEngineers: Engineer[] = data.map(eng => ({
        id: eng.id,
        name: eng.name,
        phone: eng.phone,
        email: eng.email,
        location: eng.location,
        status: eng.status,
        skillLevel: eng.skill_level,
        currentJob: eng.current_job,
        currentLocation: eng.current_location
      }));
      
      setEngineers(transformedEngineers);
    } catch (err) {
      console.error("Unexpected error fetching engineers:", err);
    }
  };
  
  const fetchServiceCalls = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_calls')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching service calls:", error);
        toast({
          title: "Error",
          description: "Failed to load service calls",
          variant: "destructive",
        });
        return;
      }
      
      const transformedCalls: ServiceCall[] = data.map(call => {
        // Parse parts_used to ensure it's an array of Part objects
        let parsedPartsUsed: Part[] = [];
        if (Array.isArray(call.parts_used)) {
          parsedPartsUsed = call.parts_used.map((part: any) => ({
            id: part.id || "",
            name: part.name || "",
            partNumber: part.partNumber || "",
            quantity: part.quantity || 0,
            price: part.price || 0
          }));
        }
        
        // Parse feedback to ensure it's a Feedback object or null
        let parsedFeedback: Feedback | null = null;
        if (call.feedback && typeof call.feedback === 'object' && !Array.isArray(call.feedback)) {
          const feedbackObj = call.feedback as Record<string, any>;
          parsedFeedback = {
            rating: typeof feedbackObj.rating === 'number' ? feedbackObj.rating : 0,
            comment: typeof feedbackObj.comment === 'string' ? feedbackObj.comment : null,
            date: typeof feedbackObj.date === 'string' ? feedbackObj.date : new Date().toISOString()
          };
        }
        
        return {
          id: call.id,
          customerId: call.customer_id,
          customerName: call.customer_name,
          phone: call.phone,
          machineId: call.machine_id || "",
          machineModel: call.machine_model,
          serialNumber: call.serial_number || "",
          location: call.location,
          issueType: call.issue_type,
          issueDescription: call.issue_description,
          callType: call.call_type,
          priority: call.priority,
          status: call.status,
          engineerId: call.engineer_id,
          engineerName: call.engineer_name || "",
          createdAt: call.created_at,
          slaDeadline: call.sla_deadline || new Date().toISOString(),
          startTime: call.start_time,
          completionTime: call.completion_time,
          partsUsed: parsedPartsUsed,
          feedback: parsedFeedback,
        };
      });
      
      setServiceCalls(transformedCalls);
      setIsLoading(false);
    } catch (err) {
      console.error("Unexpected error fetching service calls:", err);
      setIsLoading(false);
    }
  };
  
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
  
  const handleAssignEngineer = async (serviceCallId: string, engineerId: string) => {
    try {
      const assignedEngineer = engineers.find(e => e.id === engineerId);
      if (!assignedEngineer) {
        toast({
          title: "Error",
          description: "Engineer not found",
          variant: "destructive",
        });
        return;
      }
      
      // Update the service call in the database
      const { error: serviceCallError } = await supabase
        .from('service_calls')
        .update({
          engineer_id: engineerId,
          engineer_name: assignedEngineer.name,
          status: "Pending"
        })
        .eq('id', serviceCallId);
        
      if (serviceCallError) {
        console.error("Error assigning engineer:", serviceCallError);
        toast({
          title: "Error",
          description: "Failed to assign engineer to service call",
          variant: "destructive",
        });
        return;
      }
      
      // Update the engineer in the database
      const serviceCall = serviceCalls.find(call => call.id === serviceCallId);
      const { error: engineerError } = await supabase
        .from('engineers')
        .update({
          status: "On Call",
          current_job: `Service Call #${serviceCallId}`,
          current_location: serviceCall?.location || assignedEngineer.location
        })
        .eq('id', engineerId);
        
      if (engineerError) {
        console.error("Error updating engineer status:", engineerError);
        toast({
          title: "Error",
          description: "Failed to update engineer status",
          variant: "destructive",
        });
      }
      
      // Update local state
      const updatedCalls = serviceCalls.map(call => {
        if (call.id === serviceCallId) {
          return {
            ...call,
            engineerId,
            engineerName: assignedEngineer.name,
            status: "Pending"
          };
        }
        return call;
      });
      
      const updatedEngineers = engineers.map(eng => {
        if (eng.id === engineerId) {
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
      
    } catch (error) {
      console.error("Error in engineer assignment:", error);
      toast({
        title: "Error",
        description: "An error occurred while assigning the engineer",
        variant: "destructive",
      });
    }
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
    setSearchTerm("");
    fetchServiceCalls();
    fetchEngineers();
    toast({
      title: "Refreshed",
      description: "Service calls and engineers have been refreshed",
    });
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
