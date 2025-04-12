
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Engineer, EngineerStatus } from "@/types/service";
import { Phone, Mail, MapPin, Briefcase, User, Clock } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { Link } from "react-router-dom";

interface EngineerProfileProps {
  engineer: Engineer;
}

export const EngineerProfile: React.FC<EngineerProfileProps> = ({ engineer }) => {
  const isOnLeave = engineer.status === "On Leave";
  const leaveEnded = engineer.leaveEndDate && isPast(new Date(engineer.leaveEndDate));

  // Format current job display to be more user-friendly
  const formatCurrentJob = (currentJob: string | null) => {
    if (!currentJob) return "None assigned";
    
    // Check if it's a service call with the specific format
    if (currentJob.startsWith("Service Call #")) {
      const serviceCallId = currentJob.replace("Service Call #", "");
      return (
        <span>
          Service Call - <Link to={`/service?id=${serviceCallId}`} className="text-blue-600 hover:underline">
            View Details
          </Link>
        </span>
      );
    }
    
    return currentJob;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{engineer.name}</CardTitle>
            <CardDescription>{engineer.skillLevel} Engineer</CardDescription>
          </div>
          <Badge
            className={
              engineer.status === "Available"
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : engineer.status === "On Call"
                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                : engineer.status === "On Leave"
                ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                : engineer.status === "At Warehouse"
                ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
            }
          >
            {engineer.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
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
              <span>Base Location: {engineer.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Current Location: {engineer.currentLocation}</span>
            </div>
            
            {isOnLeave && engineer.leaveEndDate && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                <span className={`${leaveEnded ? "text-green-600" : "text-red-600"}`}>
                  {leaveEnded 
                    ? "Leave ended on " + format(new Date(engineer.leaveEndDate), "PP")
                    : "Returns on " + format(new Date(engineer.leaveEndDate), "PP")}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <Briefcase className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <span className="font-medium">Current Job:</span>{" "}
                {formatCurrentJob(engineer.currentJob)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Skill Level: {engineer.skillLevel}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
