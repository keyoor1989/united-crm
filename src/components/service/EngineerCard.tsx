
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Engineer, EngineerStatus } from "@/types/service";
import { User, MapPin, Phone, Wrench, Clock } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";

interface EngineerCardProps {
  engineer: Engineer;
}

export const EngineerCard: React.FC<EngineerCardProps> = ({ engineer }) => {
  const {
    name,
    location,
    phone,
    status,
    skillLevel,
    currentJob,
    currentLocation,
    leaveEndDate
  } = engineer;

  const getStatusBadge = () => {
    switch (status) {
      case "Available":
        return <Badge className="bg-green-500">Available</Badge>;
      case "On Call":
        return <Badge className="bg-amber-500">On Call</Badge>;
      case "On Leave":
        return <Badge className="bg-red-500">On Leave</Badge>;
      case "At Warehouse":
        return <Badge className="bg-blue-500">At Warehouse</Badge>;
      case "Busy":
        return <Badge className="bg-gray-500">Busy</Badge>;
      default:
        return <Badge className="bg-green-500">Available</Badge>;
    }
  };

  const getSkillLevelBadge = () => {
    switch (skillLevel) {
      case "Beginner":
        return <Badge variant="outline" className="ml-2">Beginner</Badge>;
      case "Intermediate":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 ml-2">Intermediate</Badge>;
      case "Advanced":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 ml-2">Advanced</Badge>;
      case "Expert":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-2">Expert</Badge>;
      default:
        return <Badge variant="outline" className="ml-2">Beginner</Badge>;
    }
  };

  // Calculate leave status if applicable
  const isOnLeave = status === "On Leave";
  const leaveEnded = leaveEndDate ? isPast(parseISO(leaveEndDate)) : false;

  return (
    <Card className="h-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="ml-3">
              <h3 className="font-semibold">{name}</h3>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {getStatusBadge()}
            {getSkillLevelBadge()}
          </div>
        </div>
        
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Base: {location}</span>
          </div>
          
          {currentLocation && currentLocation !== location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-700">Currently at: {currentLocation}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{phone}</span>
          </div>
          
          {currentJob && (
            <div className="flex items-center gap-1">
              <Wrench className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-700">
                {currentJob}
              </span>
            </div>
          )}
          
          {isOnLeave && leaveEndDate && (
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-4 w-4 text-red-500" />
              <span className={`text-sm ${leaveEnded ? "text-green-600" : "text-red-600"}`}>
                {leaveEnded 
                  ? "Leave ended on " + format(parseISO(leaveEndDate), "PP")
                  : "Returns on " + format(parseISO(leaveEndDate), "PP")}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
