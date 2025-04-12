
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container } from "@/components/ui/container";
import EngineerForm from "@/components/service/EngineerForm";
import { Engineer, EngineerStatus, EngineerSkillLevel } from "@/types/service";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const EngineerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [engineer, setEngineer] = React.useState<Engineer>({
    id: uuidv4(),
    name: "",
    phone: "",
    email: "",
    location: "",
    status: "Available" as EngineerStatus,
    skillLevel: "Intermediate" as EngineerSkillLevel,
    currentJob: null,
    currentLocation: "",
  });

  React.useEffect(() => {
    if (id && id !== "new") {
      fetchEngineer(id);
    }
  }, [id]);

  const fetchEngineer = async (engineerId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("engineers")
        .select("*")
        .eq("id", engineerId)
        .single();

      if (error) throw error;

      if (data) {
        setEngineer({
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          location: data.location,
          status: data.status as EngineerStatus,
          skillLevel: data.skill_level as EngineerSkillLevel,
          currentJob: data.current_job,
          currentLocation: data.current_location,
          leaveEndDate: data.leave_end_date,
        });
      }
    } catch (error) {
      console.error("Error fetching engineer:", error);
      toast.error("Failed to load engineer details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEngineer = async (engineerData: Engineer) => {
    try {
      const isNewEngineer = !id || id === "new";
      const engineerPayload = {
        id: engineerData.id,
        name: engineerData.name,
        phone: engineerData.phone,
        email: engineerData.email,
        location: engineerData.location,
        status: engineerData.status,
        skill_level: engineerData.skillLevel,
        current_job: engineerData.currentJob,
        current_location: engineerData.currentLocation,
        leave_end_date: engineerData.leaveEndDate,
      };

      if (isNewEngineer) {
        const { error } = await supabase
          .from("engineers")
          .insert(engineerPayload);

        if (error) throw error;
        toast.success("Engineer added successfully");
      } else {
        const { error } = await supabase
          .from("engineers")
          .update(engineerPayload)
          .eq("id", engineerData.id);

        if (error) throw error;
        toast.success("Engineer updated successfully");
      }

      navigate("/service");
    } catch (error) {
      console.error("Error saving engineer:", error);
      toast.error("Failed to save engineer");
    }
  };

  const handleCancel = () => {
    navigate("/service");
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-4xl mx-auto py-8">
        <EngineerForm
          engineer={engineer}
          onSave={handleSaveEngineer}
          onCancel={handleCancel}
        />
      </div>
    </Container>
  );
};

export default EngineerFormPage;
