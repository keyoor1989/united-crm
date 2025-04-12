
import { ServiceCall, Engineer, EngineerStatus } from "@/types/service";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useServiceActions = (
  serviceCalls: ServiceCall[],
  setServiceCalls: React.Dispatch<React.SetStateAction<ServiceCall[]>>,
  engineers: Engineer[],
  setEngineers: React.Dispatch<React.SetStateAction<Engineer[]>>
) => {
  const { toast } = useToast();
  const navigate = useNavigate();

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
      
      const serviceCall = serviceCalls.find(call => call.id === serviceCallId);
      const { error: engineerError } = await supabase
        .from('engineers')
        .update({
          status: "On Call" as EngineerStatus,
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
            status: "On Call" as EngineerStatus,
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

  return {
    handleAssignEngineer,
    handleReassignCall,
    handleEngineerCardClick,
  };
};
