
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Engineer, ServiceCall, Part, Feedback } from "@/types/service";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Edit,
  Calendar,
  CheckCircle,
  Clock,
  User,
  Briefcase,
} from "lucide-react";
import EngineerForm from "@/components/service/EngineerForm";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

const EngineerDetail = () => {
  const { engineerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [engineer, setEngineer] = useState<Engineer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const isNewEngineer = engineerId === "new";

  useEffect(() => {
    if (engineerId && !isNewEngineer) {
      fetchEngineer(engineerId);
      fetchServiceCalls(engineerId);
    } else if (isNewEngineer) {
      // Create a blank engineer for the new form
      setEngineer({
        id: "",
        name: "",
        phone: "",
        email: "",
        location: "",
        status: "Available",
        skillLevel: "Intermediate",
        currentJob: null,
        currentLocation: "",
      });
      setIsLoading(false);
      setShowEditForm(true);
    }
  }, [engineerId, isNewEngineer]);

  const fetchEngineer = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("engineers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching engineer:", error);
        toast({
          title: "Error",
          description: "Failed to load engineer data",
          variant: "destructive",
        });
        return;
      }

      const engineerData: Engineer = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        location: data.location,
        status: data.status,
        skillLevel: data.skill_level,
        currentJob: data.current_job,
        currentLocation: data.current_location,
      };

      setEngineer(engineerData);
    } catch (err) {
      console.error("Unexpected error fetching engineer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServiceCalls = async (engineerId: string) => {
    try {
      const { data, error } = await supabase
        .from("service_calls")
        .select("*")
        .eq("engineer_id", engineerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching service calls:", error);
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
            price: part.price || 0
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
        };
      });

      setServiceCalls(transformedCalls);
    } catch (err) {
      console.error("Unexpected error fetching service calls:", err);
    }
  };

  const handleSaveEngineer = async (updatedEngineer: Engineer) => {
    try {
      if (isNewEngineer) {
        // For new engineers, insert a new record
        const { data, error } = await supabase
          .from("engineers")
          .insert({
            name: updatedEngineer.name,
            phone: updatedEngineer.phone,
            email: updatedEngineer.email,
            location: updatedEngineer.location,
            status: updatedEngineer.status,
            skill_level: updatedEngineer.skillLevel,
            current_location: updatedEngineer.currentLocation,
            current_job: updatedEngineer.currentJob
          })
          .select();

        if (error) {
          console.error("Error creating engineer:", error);
          toast({
            title: "Error",
            description: "Failed to create engineer",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Engineer created successfully",
        });
        
        // Navigate to the newly created engineer's detail page
        if (data && data.length > 0) {
          navigate(`/engineer/${data[0].id}`);
        } else {
          navigate('/service');
        }
        
      } else {
        // For existing engineers, update the record
        const { error } = await supabase
          .from("engineers")
          .update({
            name: updatedEngineer.name,
            phone: updatedEngineer.phone,
            email: updatedEngineer.email,
            location: updatedEngineer.location,
            status: updatedEngineer.status,
            skill_level: updatedEngineer.skillLevel,
            current_location: updatedEngineer.currentLocation,
          })
          .eq("id", updatedEngineer.id);

        if (error) {
          console.error("Error updating engineer:", error);
          toast({
            title: "Error",
            description: "Failed to update engineer",
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
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading engineer data...</div>;
  }

  if (!engineer && !isNewEngineer) {
    return <div className="p-4">Engineer not found</div>;
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
          engineer={engineer || {
            id: "",
            name: "",
            phone: "",
            email: "",
            location: "",
            status: "Available",
            skillLevel: "Intermediate",
            currentJob: null,
            currentLocation: "",
          }}
          onSave={handleSaveEngineer}
          onCancel={isNewEngineer ? () => navigate(-1) : () => setShowEditForm(false)}
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">{engineer?.name}</CardTitle>
                  <CardDescription>{engineer?.skillLevel} Engineer</CardDescription>
                </div>
                <Badge
                  className={
                    engineer?.status === "Available"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : engineer?.status === "On Call"
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                      : engineer?.status === "Break"
                      ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                  }
                >
                  {engineer?.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{engineer?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{engineer?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Base Location: {engineer?.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Current Location: {engineer?.currentLocation}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>Current Job: {engineer?.currentJob || "None assigned"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Skill Level: {engineer?.skillLevel}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    <ServiceCallCard key={call.id} call={call} />
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
                    <ServiceCallCard key={call.id} call={call} />
                  ))
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4 mt-4">
              {serviceCalls.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">
                  No service calls found for this engineer.
                </p>
              ) : (
                serviceCalls.map(call => <ServiceCallCard key={call.id} call={call} />)
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

const ServiceCallCard = ({ call }: { call: ServiceCall }) => {
  return (
    <Card className="hover:bg-accent/10 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{call.customerName}</CardTitle>
            <CardDescription>{call.machineModel} - {call.serialNumber}</CardDescription>
          </div>
          <Badge
            className={
              call.status === "Completed"
                ? "bg-green-100 text-green-800"
                : call.status === "In Progress"
                ? "bg-blue-100 text-blue-800"
                : "bg-amber-100 text-amber-800"
            }
          >
            {call.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{format(parseISO(call.createdAt), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{call.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>SLA: {format(parseISO(call.slaDeadline), "MMM d, h:mm a")}</span>
          </div>
          {call.completionTime && (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              <span>{format(parseISO(call.completionTime), "MMM d, h:mm a")}</span>
            </div>
          )}
        </div>
        <Separator />
        <div>
          <p className="text-sm font-medium">Issue: {call.issueType}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {call.issueDescription}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EngineerDetail;
