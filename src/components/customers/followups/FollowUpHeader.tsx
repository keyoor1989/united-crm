
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCw } from "lucide-react";

interface FollowUpHeaderProps {
  onRefresh: () => void;
}

const FollowUpHeader: React.FC<FollowUpHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link to="/customers">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Customers
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight ml-2">Customer Follow-ups</h1>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh} 
        className="gap-1"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
};

export default FollowUpHeader;
