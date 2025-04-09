
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Wrench, Zap } from "lucide-react";
import { Engineer } from "@/types/service";

interface EngineerCardProps {
  engineer: Engineer;
  showFullDetails?: boolean;
}

export const EngineerCard: React.FC<EngineerCardProps> = ({ 
  engineer, 
  showFullDetails = false 
}) => {
  const { name, status, location, skillLevel, currentJob } = engineer;

  const getStatusBadge = () => {
    switch (status.toLowerCase()) {
      case "available":
        return <Badge className="mt-1.5 bg-green-500">Available</Badge>;
      case "on call":
        return <Badge className="mt-1.5 bg-blue-500">On Call</Badge>;
      case "break":
        return <Badge className="mt-1.5 bg-amber-500">Break</Badge>;
      case "off duty":
        return <Badge className="mt-1.5 bg-red-500">Off Duty</Badge>;
      default:
        return <Badge className="mt-1.5 bg-gray-500">{status}</Badge>;
    }
  };

  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-700";
      case "on call":
        return "bg-blue-100 text-blue-700";
      case "break":
        return "bg-amber-100 text-amber-700";
      case "off duty":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getSkillIcon = () => {
    switch (skillLevel.toLowerCase()) {
      case "expert":
        return <Zap className="h-3 w-3" />;
      case "senior":
        return <Zap className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${showFullDetails ? 'border-brand-500' : ''}`}>
      <CardContent className={`pt-6 ${showFullDetails ? 'pb-6' : ''}`}>
        <div className="flex items-start gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getStatusColor()}`}>
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className={`font-medium flex items-center gap-1 ${showFullDetails ? 'text-lg' : ''}`}>
              {name}
              {getSkillIcon() && (
                <span className="ml-1 text-amber-500 flex">
                  {getSkillIcon()}
                </span>
              )}
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <MapPin className="h-3 w-3" /> {location}
            </div>
            
            {currentJob && (
              <div className="flex items-center text-xs text-muted-foreground gap-1 mt-1">
                <Wrench className="h-3 w-3" /> Working at: {currentJob}
              </div>
            )}
            
            {getStatusBadge()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
