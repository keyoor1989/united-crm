
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, Plus } from "lucide-react";

interface PartsHeaderProps {
  onAddPart: () => void;
}

const PartsHeader: React.FC<PartsHeaderProps> = ({ onAddPart }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Machine Parts Catalogue</h1>
        <p className="text-muted-foreground">
          Manage your machine parts, toners, and other consumables
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button size="sm" onClick={onAddPart}>
          <Plus className="h-4 w-4 mr-2" />
          Add Part
        </Button>
      </div>
    </div>
  );
};

export default PartsHeader;
