
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Printer,
  User,
  Wrench,
  UserPlus,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";
import { ServiceCall, Engineer } from "@/types/service";
import { 
  formatDistanceToNow, 
  isPast,
  formatDistance
} from "date-fns";
import EngineerAssignmentSheet from "./EngineerAssignmentSheet";

interface ServiceCallCardProps {
  serviceCall: ServiceCall;
  engineers?: Engineer[];
  onShowDetails: () => void;
  onAssign: (serviceCallId: string, engineerId: string) => void;
  onReassign: (serviceCallId: string) => void;
}

export const ServiceCallCard: React.FC<ServiceCallCardProps> = ({
  serviceCall,
  engineers = [],
  onShowDetails,
  onAssign,
  onReassign,
}) => {
  const [showAssignSheet, setShowAssignSheet] = useState(false);
  
  const {
    id,
    customerName,
    machineModel,
    location,
    issueType,
    priority,
    status,
    createdAt,
    slaDeadline,
    engineerName,
    engineerId,
  } = serviceCall;

  const getPriorityBadge = () => {
    switch (priority.toLowerCase()) {
      case "critical":
        return <Badge className="bg-red-600">Critical Priority</Badge>;
      case "high":
        return <Badge className="bg-red-500">High Priority</Badge>;
      case "medium-high":
        return <Badge className="bg-amber-600">Medium-High Priority</Badge>;
      case "medium":
        return <Badge className="bg-amber-500">Medium Priority</Badge>;
      case "standard":
        return <Badge className="bg-blue-500">Standard Priority</Badge>;
      case "low":
        return <Badge className="bg-blue-400">Low Priority</Badge>;
      default:
        return <Badge className="bg-blue-500">Standard Priority</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case "new":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case "in progress":
        return <Wrench className="h-5 w-5 text-amber-500" />;
      case "delayed":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "escalated":
        return <AlertOctagon className="h-5 w-5 text-orange-500" />;
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusBadge = () => {
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

  const timeCreated = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
  const slaDeadlineDate = new Date(slaDeadline);
  const isPastDeadline = isPast(slaDeadlineDate);
  const timeToDeadline = formatDistance(
    new Date(),
    slaDeadlineDate,
    { addSuffix: true }
  );

  // Show assignment button for 'New' and unassigned calls
  const needsEngineerAssignment = (status.toLowerCase() === "new" && !engineerId) || 
                                 (status.toLowerCase() === "pending" && !engineerId);

  return (
    <>
      <Card className="overflow-hidden">
        <div className="bg-muted p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h3 className="font-semibold">{customerName}</h3>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {getPriorityBadge()}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Printer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{machineModel}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Reported {timeCreated}</span>
            </div>

            <div className={`flex items-center gap-2 p-2 rounded-md ${
              isPastDeadline ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
            }`}>
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                SLA: {timeToDeadline}
              </span>
            </div>

            <div className="py-2 border-t border-b">
              <div className="text-sm font-medium mb-1">Issue: {issueType}</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {engineerName || "Unassigned"}
                </span>
              </div>
              <div className="flex gap-1">
                {needsEngineerAssignment && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => setShowAssignSheet(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign
                  </Button>
                )}
                {engineerId && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => onReassign(id)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Reassign
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1"
                  onClick={onShowDetails}
                >
                  Details
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <EngineerAssignmentSheet
        open={showAssignSheet}
        onOpenChange={setShowAssignSheet}
        serviceCall={serviceCall}
        engineers={engineers}
        onAssign={onAssign}
      />
    </>
  );
};
