
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";

interface ServiceSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

export const ServiceSearchBar: React.FC<ServiceSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh,
}) => {
  const { toast } = useToast();

  const handleRefresh = () => {
    onSearchChange("");
    onRefresh();
    toast({
      title: "Refreshed",
      description: "Service calls have been refreshed",
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by customer, serial number or location..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button variant="outline" size="icon">
        <Filter className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon"
        onClick={handleRefresh}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
};
