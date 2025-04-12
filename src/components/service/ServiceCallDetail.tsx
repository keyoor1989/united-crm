
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ServiceCall, Engineer, EngineerStatus } from "@/types/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, Download, ThumbsUp, User, XCircle } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface ServiceCallDetailProps {
  serviceCall: ServiceCall;
  engineers: Engineer[];
  onClose: () => void;
  onUpdate: () => void; // Renamed from refreshCalls to onUpdate
}

const ServiceCallDetail: React.FC<ServiceCallDetailProps> = ({
  serviceCall,
  engineers,
  onClose,
  onUpdate,
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [engineerId, setEngineerId] = useState(serviceCall.engineerId || "");
  const [status, setStatus] = useState(serviceCall.status || "");
  const [resolutionNotes, setResolutionNotes] = useState(serviceCall.issueDescription || ""); 
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveChanges = async () => {
    try {
      setIsUpdating(true);

      console.log("Saving changes:", { engineerId, status, resolutionNotes });
      
      // First, update the service call in the database
      const { error: serviceCallError } = await supabase
        .from('service_calls')
        .update({
          engineer_id: engineerId === "unassigned" ? null : engineerId,
          status,
          issue_description: resolutionNotes,
          completion_time: status === "Completed" ? new Date().toISOString() : serviceCall.completionTime
        })
        .eq('id', serviceCall.id);

      if (serviceCallError) throw serviceCallError;
      
      // If the status is Completed, update the engineer's status to Available
      if (status === "Completed") {
        // If there was an engineer assigned to this call, update their status
        if (serviceCall.engineerId && serviceCall.engineerId !== "unassigned") {
          console.log("Updating engineer status to Available:", serviceCall.engineerId);
          const { error: engineerError } = await supabase
            .from('engineers')
            .update({
              status: 'Available' as EngineerStatus,
              current_job: null
            })
            .eq('id', serviceCall.engineerId);
            
          if (engineerError) {
            console.error("Error updating engineer status:", engineerError);
            // We don't throw here to avoid failing the whole operation
          }
        }
        
        // If a different engineer is currently assigned when completing, also update them
        if (engineerId && engineerId !== "unassigned" && engineerId !== serviceCall.engineerId) {
          console.log("Also updating newly assigned engineer to Available:", engineerId);
          const { error: newEngineerError } = await supabase
            .from('engineers')
            .update({
              status: 'Available' as EngineerStatus,
              current_job: null
            })
            .eq('id', engineerId);
            
          if (newEngineerError) {
            console.error("Error updating new engineer status:", newEngineerError);
          }
        }
      }
      
      // If status changed to "Assigned" and engineer is assigned, update engineer status
      if (status === "Assigned" && engineerId && engineerId !== "unassigned" && 
          (serviceCall.status !== "Assigned" || serviceCall.engineerId !== engineerId)) {
        console.log("Setting engineer to On Call:", engineerId);
        const { error: engineerError } = await supabase
          .from('engineers')
          .update({
            status: 'On Call' as EngineerStatus,
            current_job: serviceCall.id
          })
          .eq('id', engineerId);
          
        if (engineerError) {
          console.error("Error updating engineer status:", engineerError);
        }
      }
      
      // If engineer was changed (reassigned), update previous engineer's status
      if (serviceCall.engineerId && serviceCall.engineerId !== engineerId && 
          serviceCall.engineerId !== "unassigned") {
        console.log("Freeing up previously assigned engineer:", serviceCall.engineerId);
        const { error: prevEngineerError } = await supabase
          .from('engineers')
          .update({
            status: 'Available' as EngineerStatus,
            current_job: null
          })
          .eq('id', serviceCall.engineerId);
          
        if (prevEngineerError) {
          console.error("Error updating previous engineer status:", prevEngineerError);
        }
      }
      
      toast({
        title: "Service call updated",
        description: `Service call #${serviceCall.id} has been updated successfully.`,
      });
      
      setIsEditing(false);
      setIsUpdating(false);
      onUpdate(); // Refresh the service calls list
    } catch (error) {
      console.error("Error updating service call:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the service call.",
        variant: "destructive",
      });
      setIsUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "outline";
      case "Assigned":
        return "secondary";
      case "In Progress":
        return "default";
      case "Completed":
        return "success";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto p-1">
      {/* Header */}
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Service Call #{serviceCall.id}</h3>
          <Badge variant={getStatusBadgeVariant(serviceCall.status)}>{serviceCall.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Created on {formatDate(serviceCall.createdAt)}
        </p>
      </div>
      
      <Separator />
      
      {/* Customer Information */}
      <div>
        <h4 className="text-lg font-medium mb-4">Customer Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Customer Name</Label>
            <div className="p-2 rounded bg-muted font-medium">
              {serviceCall.customerName}
            </div>
          </div>
          <div>
            <Label>Phone</Label>
            <div className="p-2 rounded bg-muted font-medium">
              {serviceCall.phone}
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <div className="p-2 rounded bg-muted font-medium">
              {serviceCall.location}
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <div className="p-2 rounded bg-muted font-medium">
              N/A
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Machine Information */}
      <div>
        <h4 className="text-lg font-medium mb-4">Machine Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Machine Model</Label>
            <div className="p-2 rounded bg-muted font-medium">
              {serviceCall.machineModel}
            </div>
          </div>
          <div>
            <Label>Serial Number</Label>
            <div className="p-2 rounded bg-muted font-medium">
              {serviceCall.serialNumber}
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Issue Information */}
      <div>
        <h4 className="text-lg font-medium mb-4">Issue Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Issue Type</Label>
            <div className="p-2 rounded bg-muted font-medium">
              {serviceCall.issueType}
            </div>
          </div>
          <div>
            <Label>Call Type</Label>
            <div className="p-2 rounded bg-muted font-medium">
              {serviceCall.callType}
            </div>
          </div>
          <div>
            <Label>Priority</Label>
            <div className="p-2 rounded bg-muted font-medium">
              {serviceCall.priority}
            </div>
          </div>
        </div>
        <div>
          <Label>Issue Description</Label>
          <div className="p-2 rounded bg-muted font-medium whitespace-pre-line min-h-[80px]">
            {serviceCall.issueDescription}
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Assignment Information */}
      <div>
        <h4 className="text-lg font-medium mb-4">Assignment Information</h4>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="engineer">Assigned Engineer</Label>
              <Select 
                value={engineerId} 
                onValueChange={setEngineerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an engineer" />
                </SelectTrigger>
                <SelectContent>
                  {/* Note: Using a non-empty string "unassigned" instead of empty string "" */}
                  <SelectItem value="unassigned">Not Assigned</SelectItem>
                  {engineers.map((engineer) => (
                    <SelectItem key={engineer.id} value={engineer.id}>
                      {engineer.name} ({engineer.location})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status} 
                onValueChange={setStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="resolutionNotes">Resolution Notes</Label>
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter resolution notes..."
                className="min-h-[120px]"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Assigned Engineer</Label>
                <div className="flex items-center p-2 rounded bg-muted font-medium">
                  <User className="h-4 w-4 mr-2" />
                  {serviceCall.engineerName || "Not assigned yet"}
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex items-center p-2 rounded bg-muted font-medium">
                  <Clock className="h-4 w-4 mr-2" />
                  {serviceCall.status}
                </div>
              </div>
            </div>
            <div>
              <Label>Resolution Notes</Label>
              <div className="p-2 rounded bg-muted font-medium whitespace-pre-line min-h-[80px]">
                {serviceCall.issueDescription || "No resolution notes yet."}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-4">
        <div className="flex items-center space-x-2">
          {!isEditing && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isUpdating}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveChanges}
                disabled={isUpdating}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Update Service Call
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCallDetail;
