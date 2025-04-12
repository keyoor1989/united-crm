
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ServiceCall } from "@/types/service";
import { Calendar, MapPin, Clock, CheckCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

interface ServiceCallCardProps {
  call: ServiceCall;
}

export const DetailedServiceCallCard: React.FC<ServiceCallCardProps> = ({ call }) => {
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
