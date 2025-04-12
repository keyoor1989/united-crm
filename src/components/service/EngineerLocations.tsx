
import React from "react";
import { EngineerCard } from "@/components/service/EngineerCard";
import { Engineer } from "@/types/service";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

interface EngineerLocationsProps {
  engineers: Engineer[];
  onEngineerClick: (engineerId: string) => void;
}

export const EngineerLocations: React.FC<EngineerLocationsProps> = ({
  engineers,
  onEngineerClick,
}) => {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Engineer Locations</h2>
        <Link to="/engineer/new">
          <Button variant="outline" size="sm" className="gap-1">
            <UserPlus className="h-4 w-4" />
            Add Engineer
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {engineers.map((engineer) => (
          <div 
            key={engineer.id} 
            className="cursor-pointer hover:scale-[1.01] transition-transform"
            onClick={() => onEngineerClick(engineer.id)}
          >
            <EngineerCard engineer={engineer} />
          </div>
        ))}
      </div>
    </div>
  );
};
