
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ServiceCall, Engineer, EngineerStatus, EngineerSkillLevel, Part, Feedback } from "@/types/service";

export const useServiceData = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceCallIdParam = searchParams.get('id');
  
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
  
  useEffect(() => {
    if (serviceCallIdParam && serviceCalls.length > 0) {
      const serviceCall = serviceCalls.find(call => call.id === serviceCallIdParam);
      if (serviceCall) {
        setSelectedServiceCall(serviceCall);
        setShowDetailDialog(true);
      } else {
        toast({
          title: "Service Call Not Found",
          description: `Service call with ID ${serviceCallIdParam} was not found`,
          variant: "destructive",
        });
      }
    }
  }, [serviceCallIdParam, serviceCalls, toast]);
  
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
      
      const transformedEngineers: Engineer[] = data.map(eng => {
        return {
          id: eng.id,
          name: eng.name,
          phone: eng.phone,
          email: eng.email,
          location: eng.location,
          status: eng.status as EngineerStatus,
          skillLevel: eng.skill_level as EngineerSkillLevel,
          currentJob: eng.current_job,
          currentLocation: eng.current_location,
          leaveEndDate: eng.leave_end_date || undefined
        };
      });
      
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
        let parsedPartsUsed: Part[] = [];
        if (Array.isArray(call.parts_used)) {
          parsedPartsUsed = call.parts_used.map((part: any) => ({
            id: part.id || "",
            name: part.name || "",
            partNumber: part.partNumber || "",
            quantity: part.quantity || 0,
            price: part.price || 0,
            isReconciled: part.isReconciled || false
          }));
        }
        
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
          serviceCharge: call.service_charge || 0,
          isPaid: call.is_paid || false,
          paymentDate: call.payment_date,
          paymentMethod: call.payment_method,
          partsReconciled: call.parts_reconciled || false
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
  
  const handleShowDetails = (serviceCall: ServiceCall) => {
    setSelectedServiceCall(serviceCall);
    setShowDetailDialog(true);
  };
  
  const handleDialogClose = () => {
    setShowDetailDialog(false);
    if (serviceCallIdParam) {
      navigate('/service', { replace: true });
    }
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
  
  return {
    serviceCalls,
    engineers,
    searchTerm,
    selectedServiceCall,
    showDetailDialog,
    isLoading,
    pendingCalls: filterCalls("pending"),
    inProgressCalls: filterCalls("in progress"),
    completedCalls: filterCalls("completed"),
    allCalls: filterCalls("all"),
    setSearchTerm,
    setSelectedServiceCall,
    setShowDetailDialog,
    handleShowDetails,
    handleDialogClose,
    handleRefresh,
    fetchServiceCalls,
    fetchEngineers
  };
};
