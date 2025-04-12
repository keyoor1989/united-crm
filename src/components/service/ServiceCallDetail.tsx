
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  Printer,
  AlertCircle,
  CheckCircle2,
  Phone,
  User,
  Wrench,
  Calendar,
} from "lucide-react";
import { ServiceCall } from "@/types/service";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ServiceCallDetailProps {
  serviceCall: ServiceCall;
  onClose: () => void;
  onUpdate?: () => void;
}

const ServiceCallDetail: React.FC<ServiceCallDetailProps> = ({
  serviceCall,
  onClose,
  onUpdate,
}) => {
  const { toast } = useToast();
  
  const {
    id,
    customerName,
    phone,
    machineModel,
    serialNumber,
    location,
    issueType,
    issueDescription,
    callType,
    priority,
    status,
    createdAt,
    slaDeadline,
    engineerName,
  } = serviceCall;
  
  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_calls')
        .update({
          status: newStatus,
          // If marking as in progress and startTime is not set, set it now
          ...(newStatus === "In Progress" && !serviceCall.startTime 
            ? { start_time: new Date().toISOString() } 
            : {}),
          // If marking as completed, set completionTime
          ...(newStatus === "Completed" 
            ? { completion_time: new Date().toISOString() } 
            : {})
        })
        .eq('id', id);
        
      if (error) {
        console.error("Error updating service call status:", error);
        toast({
          title: "Error",
          description: "Failed to update service call status",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Status Updated",
        description: `Service call status updated to ${newStatus}`,
      });
      
      if (onUpdate) {
        onUpdate();
      }
      
      onClose();
    } catch (error) {
      console.error("Error in status update:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the status",
        variant: "destructive",
      });
    }
  };
  
  const formattedCreatedAt = new Date(createdAt).toLocaleString();
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
  const slaDeadlineDate = new Date(slaDeadline);
  const isPastDeadline = isPast(slaDeadlineDate);
  const formattedDeadline = format(slaDeadlineDate, "PPpp");
  
  const getPriorityBadge = () => {
    switch (priority.toLowerCase()) {
      case "critical":
        return <Badge className="bg-red-600">Critical</Badge>;
      case "high":
        return <Badge className="bg-red-500">High</Badge>;
      case "medium-high":
        return <Badge className="bg-amber-600">Medium-High</Badge>;
      case "medium":
        return <Badge className="bg-amber-500">Medium</Badge>;
      case "standard":
        return <Badge className="bg-blue-500">Standard</Badge>;
      case "low":
        return <Badge className="bg-blue-400">Low</Badge>;
      default:
        return <Badge className="bg-blue-500">Standard</Badge>;
    }
  };

  const getStatusBadge = () => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>;
      case "in progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-amber-500">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{customerName}</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{phone}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {getPriorityBadge()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="border rounded-md p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Machine Details</h3>
            <div className="flex items-center gap-2">
              <Printer className="h-4 w-4 text-muted-foreground" />
              <span>{machineModel}</span>
            </div>
            {serialNumber && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span>S/N: {serialNumber}</span>
              </div>
            )}
          </div>

          <div className="border rounded-md p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Location</h3>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{location}</span>
            </div>
          </div>

          <div className="border rounded-md p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Issue Details</h3>
            <div>
              <div className="font-medium">{issueType}</div>
              <p className="text-sm mt-1">{issueDescription}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Call Type: {callType}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border rounded-md p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Timing</h3>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div>Created: {formattedCreatedAt}</div>
                <div className="text-sm text-muted-foreground">({timeAgo})</div>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 p-2 rounded-md ${
              isPastDeadline ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
            }`}>
              <Clock className="h-4 w-4" />
              <div>
                <div>SLA Deadline: {formattedDeadline}</div>
                {isPastDeadline && (
                  <div className="text-sm font-medium text-red-700">OVERDUE</div>
                )}
              </div>
            </div>
          </div>

          <div className="border rounded-md p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Assigned Engineer</h3>
            {engineerName ? (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{engineerName}</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No engineer assigned</div>
            )}
          </div>

          {status !== "Completed" && status !== "Cancelled" && (
            <div className="border rounded-md p-4 space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">Actions</h3>
              
              <div className="flex flex-wrap gap-2">
                {status === "Pending" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="gap-1"
                    onClick={() => handleUpdateStatus("In Progress")}
                  >
                    <Wrench className="h-4 w-4" />
                    Start Work
                  </Button>
                )}
                
                {status === "In Progress" && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1 border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => handleUpdateStatus("Completed")}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Completed
                  </Button>
                )}
                
                {(status === "Pending" || status === "In Progress") && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1 border-gray-500 text-gray-600 hover:bg-gray-50"
                    onClick={() => handleUpdateStatus("Cancelled")}
                  >
                    Cancel Service Call
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default ServiceCallDetail;
