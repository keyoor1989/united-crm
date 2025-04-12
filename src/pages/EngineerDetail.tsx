import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Engineer, ServiceCall, Part, Feedback, EngineerStatus, EngineerSkillLevel } from "@/types/service";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import EngineerForm from "@/components/service/EngineerForm";
import { EngineerProfile } from "@/components/service/EngineerProfile";
import { EngineerServiceCallTabs } from "@/components/service/EngineerServiceCallTabs";
import { Skeleton } from "@/components/ui/skeleton";

const EngineerDetail = () => {
  const params = useParams();
  const engineerId = params.id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [engineer, setEngineer] = useState<Engineer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [showEditForm, setShowEditForm] = useState(false);

  const isNewEngineer = engineerId === "new";

  const createBlankEngineer = (): Engineer => ({
    id: "",
    name: "",
    phone: "",
    email: "",
    location: "",
    status: "Available" as EngineerStatus,
    skillLevel: "Intermediate" as EngineerSkillLevel,
    currentJob: null,
    currentLocation: "",
    leaveEndDate: ""
  });

  useEffect(() => {
    console.log("EngineerDetail mounted, engineerId:", engineerId, "isNewEngineer:", isNewEngineer);
    
    if (isNewEngineer) {
      console.log("Creating new engineer form - no data to fetch");
      setIsLoading(false);
      setShowEditForm(true);
      
      setEngineer(createBlankEngineer());
    } else if (engineerId) {
      console.log("Fetching existing engineer with ID:", engineerId);
      fetchEngineer(engineerId);
      fetchServiceCalls(engineerId);
    } else {
      console.log("No engineerId provided, setting loading to false");
      setIsLoading(false);
      toast({
        title: "Error",
        description: "No engineer ID provided",
        variant: "destructive",
      });
    }
  }, [engineerId, isNewEngineer]);

  const fetchEngineer = async (id: string) => {
    setIsLoading(true);
    try {
      console.log("Fetching engineer with ID:", id);
      const { data, error } = await supabase
        .from("engineers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching engineer:", error);
        toast({
          title: "Error",
          description: "Failed to load engineer data: " + error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log("Engineer data fetched:", data);
      if (!data) {
        toast({
          title: "Not Found",
          description: "Engineer not found",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const engineerData: Engineer = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        location: data.location,
        status: data.status as EngineerStatus,
        skillLevel: data.skill_level as EngineerSkillLevel,
        currentJob: data.current_job,
        currentLocation: data.current_location,
        leaveEndDate: data.leave_end_date
      };

      setEngineer(engineerData);
    } catch (err) {
      console.error("Unexpected error fetching engineer:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServiceCalls = async (engineerId: string) => {
    try {
      console.log("Fetching service calls for engineer:", engineerId);
      const { data, error } = await supabase
        .from("service_calls")
        .select("*")
        .eq("engineer_id", engineerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching service calls:", error);
        return;
      }

      console.log("Service calls data:", data);
      const transformedCalls: ServiceCall[] = data.map(call => {
        let parsedPartsUsed: Part[] = [];
        if (call.parts_used) {
          try {
            const partsData = Array.isArray(call.parts_used) 
              ? call.parts_used 
              : (typeof call.parts_used === 'string' ? JSON.parse(call.parts_used) : []);
            
            parsedPartsUsed = partsData.map((part: any) => ({
              id: part.id || "",
              name: part.name || "",
              partNumber: part.partNumber || "",
              quantity: part.quantity || 0,
              price: part.price || 0
            }));
          } catch (e) {
            console.error("Error parsing parts_used:", e);
          }
        }
        
        let parsedFeedback: Feedback | null = null;
        if (call.feedback) {
          try {
            const feedbackData = typeof call.feedback === 'string' 
              ? JSON.parse(call.feedback) 
              : call.feedback;
            
            if (feedbackData && typeof feedbackData === 'object' && !Array.isArray(feedbackData)) {
              parsedFeedback = {
                rating: typeof feedbackData.rating === 'number' ? feedbackData.rating : 0,
                comment: typeof feedbackData.comment === 'string' ? feedbackData.comment : null,
                date: typeof feedbackData.date === 'string' ? feedbackData.date : new Date().toISOString()
              };
            }
          } catch (e) {
            console.error("Error parsing feedback:", e);
          }
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
    } catch (err) {
      console.error("Unexpected error fetching service calls:", err);
    }
  };

  const handleSaveEngineer = async (updatedEngineer: Engineer) => {
    try {
      console.log("Saving engineer:", updatedEngineer);
      
      if (isNewEngineer) {
        console.log("Creating new engineer in database");
        const { data, error } = await supabase
          .from("engineers")
          .insert({
            name: updatedEngineer.name,
            phone: updatedEngineer.phone,
            email: updatedEngineer.email,
            location: updatedEngineer.location,
            status: updatedEngineer.status,
            skill_level: updatedEngineer.skillLevel,
            current_location: updatedEngineer.currentLocation || updatedEngineer.location,
            current_job: null
          })
          .select();

        if (error) {
          console.error("Error creating engineer:", error);
          toast({
            title: "Error",
            description: "Failed to create engineer: " + error.message,
            variant: "destructive",
          });
          return;
        }

        console.log("New engineer created successfully:", data);
        toast({
          title: "Success",
          description: "Engineer created successfully",
        });
        
        if (data && data.length > 0) {
          navigate(`/engineer/${data[0].id}`);
        } else {
          navigate('/service');
        }
        
      } else {
        console.log("Updating existing engineer in database");
        const { error } = await supabase
          .from("engineers")
          .update({
            name: updatedEngineer.name,
            phone: updatedEngineer.phone,
            email: updatedEngineer.email,
            location: updatedEngineer.location,
            status: updatedEngineer.status,
            skill_level: updatedEngineer.skillLevel,
            current_location: updatedEngineer.currentLocation || updatedEngineer.location,
            current_job: updatedEngineer.currentJob || null
          })
          .eq("id", updatedEngineer.id);

        if (error) {
          console.error("Error updating engineer:", error);
          toast({
            title: "Error",
            description: "Failed to update engineer: " + error.message,
            variant: "destructive",
          });
          return;
        }

        setEngineer(updatedEngineer);
        setShowEditForm(false);
        toast({
          title: "Success",
          description: "Engineer updated successfully",
        });
      }
    } catch (err) {
      console.error("Unexpected error saving engineer:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving",
        variant: "destructive",
      });
    }
  };

  if (isLoading && !isNewEngineer) {
    return (
      <div className="p-4 flex justify-center items-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading engineer data...</p>
        </div>
      </div>
    );
  }

  if (!engineer && !isNewEngineer) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Engineer not found</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {!isNewEngineer && (
          <Button onClick={() => setShowEditForm(!showEditForm)}>
            <Edit className="h-4 w-4 mr-2" />
            {showEditForm ? "Cancel Edit" : "Edit Engineer"}
          </Button>
        )}
      </div>

      {showEditForm || isNewEngineer ? (
        <EngineerForm
          engineer={engineer || createBlankEngineer()}
          onSave={handleSaveEngineer}
          onCancel={isNewEngineer ? () => navigate(-1) : () => setShowEditForm(false)}
        />
      ) : (
        <>
          {engineer && <EngineerProfile engineer={engineer} />}
          <EngineerServiceCallTabs serviceCalls={serviceCalls} />
        </>
      )}
    </div>
  );
};

export default EngineerDetail;
