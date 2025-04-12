
import React, { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User,
  MapPin,
  Search,
  Star,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { ServiceCall, Engineer } from "@/types/service";
import { useToast } from "@/hooks/use-toast";

interface EngineerAssignmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceCall: ServiceCall;
  engineers: Engineer[];
  onAssign: (serviceCallId: string, engineerId: string) => void;
}

const EngineerAssignmentSheet: React.FC<EngineerAssignmentSheetProps> = ({
  open,
  onOpenChange,
  serviceCall,
  engineers,
  onAssign,
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEngineerId, setSelectedEngineerId] = useState<string | null>(null);
  
  // Filter out engineers who are not available or on leave
  const availableEngineers = engineers.filter(eng => 
    eng.status === "Available" || eng.status === "At Warehouse"
  );
  
  const filteredEngineers = availableEngineers.filter(eng =>
    eng.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eng.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort engineers by location matching the service call location first
  const sortedEngineers = [...filteredEngineers].sort((a, b) => {
    const aLocationMatch = a.location === serviceCall.location;
    const bLocationMatch = b.location === serviceCall.location;
    
    if (aLocationMatch && !bLocationMatch) return -1;
    if (!aLocationMatch && bLocationMatch) return 1;
    return 0;
  });
  
  const handleAssign = () => {
    if (selectedEngineerId) {
      onAssign(serviceCall.id, selectedEngineerId);
      onOpenChange(false);
    } else {
      toast({
        title: "Error",
        description: "Please select an engineer to assign",
        variant: "destructive",
      });
    }
  };
  
  const handleAutoAssign = () => {
    // Find the closest engineer with matching location
    const sameLocationEngineers = availableEngineers.filter(
      eng => eng.location === serviceCall.location
    );
    
    if (sameLocationEngineers.length > 0) {
      // If there are engineers in the same location, pick the first one
      const engineerId = sameLocationEngineers[0].id;
      setSelectedEngineerId(engineerId);
      
      toast({
        title: "Auto-Assigned",
        description: `${sameLocationEngineers[0].name} has been selected based on location match`,
      });
    } else if (availableEngineers.length > 0) {
      // If no engineers in the same location, pick the first available one
      const engineerId = availableEngineers[0].id;
      setSelectedEngineerId(engineerId);
      
      toast({
        title: "Auto-Assigned",
        description: `${availableEngineers[0].name} has been selected as the closest available engineer`,
      });
    } else {
      toast({
        title: "No Engineers Available",
        description: "There are no available engineers to assign at this time",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <Badge className="bg-green-500">Available</Badge>;
      case "At Warehouse":
        return <Badge className="bg-blue-500">At Warehouse</Badge>;
      default:
        return <Badge className="bg-green-500">Available</Badge>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle>Assign Engineer</SheetTitle>
          <SheetDescription>
            Select an engineer to assign to this service call for {serviceCall.customerName}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-md mb-2">
            <h3 className="font-medium mb-1">Service Call Details</h3>
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4" /> {serviceCall.location}
              </div>
              <div>Issue: {serviceCall.issueType}</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search engineers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={handleAutoAssign}>
              Auto-Assign
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground mb-2">
            {filteredEngineers.length === 0 ? (
              <div className="text-center py-2">
                No available engineers {searchTerm ? "matching your search" : ""}
              </div>
            ) : (
              <div>{filteredEngineers.length} available engineers</div>
            )}
          </div>
          
          {engineers.length > 0 && availableEngineers.length === 0 && (
            <div className="p-3 rounded-md border border-amber-200 bg-amber-50 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span className="font-medium text-amber-700">No Available Engineers</span>
              </div>
              <p className="text-sm text-amber-600 mt-1">
                All engineers are currently busy or on leave. Consider waiting for an engineer to become available or marking the task as urgent to prioritize reassignment.
              </p>
            </div>
          )}
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {sortedEngineers.map((engineer) => (
              <div
                key={engineer.id}
                className={`p-3 rounded-md border transition-colors cursor-pointer ${
                  selectedEngineerId === engineer.id
                    ? "border-brand-500 bg-brand-50"
                    : "hover:bg-muted"
                }`}
                onClick={() => setSelectedEngineerId(engineer.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium flex items-center gap-1">
                        {engineer.name}
                        {engineer.skillLevel === "Expert" && (
                          <Zap className="h-3 w-3 text-amber-500" />
                        )}
                      </div>
                      {getStatusBadge(engineer.status)}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {engineer.location === serviceCall.location ? (
                        <span className="text-brand-600 font-medium">
                          {engineer.location} (Location Match)
                        </span>
                      ) : (
                        <span>{engineer.location}</span>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-1 mt-1">
                      <Star className="h-3 w-3" />
                      {engineer.skillLevel}
                    </div>
                  </div>
                  
                  {selectedEngineerId === engineer.id && (
                    <CheckCircle2 className="h-5 w-5 text-brand-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <SheetFooter className="mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedEngineerId}
          >
            Assign Engineer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EngineerAssignmentSheet;
