import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EngineerCard } from "@/components/service/EngineerCard";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Wrench,
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  UserPlus,
  AlertOctagon,
  AlertCircle
} from "lucide-react";
import { Engineer, ServiceCall } from "@/types/service";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EngineerForm from "@/components/service/EngineerForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EngineerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [engineer, setEngineer] = useState<Engineer | null>(null);
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const isNewEngineer = id === "new";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      if (isNewEngineer) {
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
        setServiceCalls([]);
        setLoading(false);
        return;
      }

      try {
        const { data: engineerData, error: engineerError } = await supabase
          .from('engineers')
          .select('*')
          .eq('id', id)
          .single();
          
        if (engineerError) {
          console.error("Error fetching engineer:", engineerError);
          toast({
            title: "Error",
            description: "Failed to load engineer details",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        if (engineerData) {
          const transformedEngineer: Engineer = {
            id: engineerData.id,
            name: engineerData.name,
            phone: engineerData.phone,
            email: engineerData.email,
            location: engineerData.location,
            status: engineerData.status,
            skillLevel: engineerData.skill_level,
            currentJob: engineerData.current_job,
            currentLocation: engineerData.current_location,
          };
          
          setEngineer(transformedEngineer);
          
          const { data: callsData, error: callsError } = await supabase
            .from('service_calls')
            .select('*')
            .eq('engineer_id', id)
            .order('created_at', { ascending: false });
            
          if (callsError) {
            console.error("Error fetching service calls:", callsError);
            toast({
              title: "Warning",
              description: "Failed to load engineer's service calls",
              variant: "destructive",
            });
          } else {
            const transformedCalls: ServiceCall[] = callsData.map(call => ({
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
              partsUsed: Array.isArray(call.parts_used) 
                ? call.parts_used.map((part: any) => ({
                    id: part.id || "",
                    name: part.name || "",
                    partNumber: part.partNumber || "",
                    quantity: part.quantity || 0,
                    price: part.price || 0
                  }))
                : [],
              feedback: call.feedback 
                ? {
                    rating: call.feedback.rating || 0,
                    comment: call.feedback.comment || null,
                    date: call.feedback.date || new Date().toISOString()
                  }
                : null,
            }));
            
            setServiceCalls(transformedCalls);
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isNewEngineer, toast]);

  const handleSaveEngineer = async (updatedEngineer: Engineer) => {
    try {
      const engineerData = {
        name: updatedEngineer.name,
        phone: updatedEngineer.phone,
        email: updatedEngineer.email,
        location: updatedEngineer.location,
        status: updatedEngineer.status,
        skill_level: updatedEngineer.skillLevel,
        current_job: updatedEngineer.currentJob,
        current_location: updatedEngineer.currentLocation,
      };
      
      if (isNewEngineer) {
        const { data, error } = await supabase
          .from('engineers')
          .insert(engineerData)
          .select();
          
        if (error) {
          console.error("Error creating engineer:", error);
          toast({
            title: "Error",
            description: "Failed to create engineer record",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Engineer Created",
          description: "The engineer has been added successfully",
        });
      } else {
        const { error } = await supabase
          .from('engineers')
          .update(engineerData)
          .eq('id', updatedEngineer.id);
          
        if (error) {
          console.error("Error updating engineer:", error);
          toast({
            title: "Error",
            description: "Failed to update engineer record",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Engineer Updated",
          description: "The engineer has been updated successfully",
        });
      }
      
      navigate("/service");
    } catch (error) {
      console.error("Unexpected error saving engineer:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return <Badge className="bg-blue-500">New</Badge>;
      case "in progress":
        return <Badge className="bg-amber-500">In Progress</Badge>;
      case "delayed":
        return <Badge className="bg-red-500">Delayed</Badge>;
      case "escalated":
        return <Badge className="bg-orange-500">Escalated</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>;
      default:
        return <Badge className="bg-blue-500">New</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "in progress":
        return <Wrench className="h-4 w-4 text-amber-500" />;
      case "delayed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "escalated":
        return <AlertOctagon className="h-4 w-4 text-orange-500" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading engineer details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!engineer && !isNewEngineer) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold">Engineer Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The engineer you are looking for does not exist or has been removed.
          </p>
          <Button onClick={() => navigate("/service")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Service
          </Button>
        </div>
      </Layout>
    );
  }

  if (isNewEngineer) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/service")}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Service
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Add New Engineer</h1>
              <p className="text-muted-foreground">
                Create a new engineer profile in the system
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engineer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <EngineerForm 
                engineer={engineer} 
                onSave={handleSaveEngineer}
              />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/service")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Service
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{engineer.name}</h1>
            <p className="text-muted-foreground">
              {engineer.skillLevel} Engineer • {engineer.location}
            </p>
          </div>
          <Button onClick={() => setShowFormDialog(true)}>
            Edit Engineer
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Engineer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <EngineerCard engineer={engineer} showFullDetails={true} />
                
                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{engineer.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{engineer.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Current Location: {engineer.currentLocation}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Service Calls</CardTitle>
              </CardHeader>
              <CardContent>
                {serviceCalls.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Active Service Calls</h3>
                    <p className="text-muted-foreground">
                      {engineer.name} is not currently assigned to any service calls.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceCalls.map(call => (
                      <Card key={call.id} className="overflow-hidden">
                        <div className="p-2 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(call.status)}
                              <span className="font-medium">{call.id}</span>
                            </div>
                            {getStatusBadge(call.status)}
                          </div>
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="font-medium">{call.customerName}</div>
                            <div className="text-sm text-muted-foreground">{call.machineModel} ({call.serialNumber})</div>
                            <div className="text-sm">{call.issueType}: {call.issueDescription.substring(0, 60)}...</div>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>Created: {new Date(call.createdAt).toLocaleDateString()}</span>
                              <Clock className="h-3 w-3 ml-2" />
                              <span>SLA: {new Date(call.slaDeadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Engineer: {engineer.name}</DialogTitle>
          </DialogHeader>
          {engineer && (
            <EngineerForm 
              engineer={engineer} 
              onSave={(updatedEngineer) => {
                handleSaveEngineer(updatedEngineer);
                setShowFormDialog(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default EngineerDetail;
