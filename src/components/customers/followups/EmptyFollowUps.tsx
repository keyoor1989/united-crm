
import React from "react";
import { Calendar } from "lucide-react";

interface EmptyFollowUpsProps {
  activeTab: "today" | "week" | "all";
}

const EmptyFollowUps: React.FC<EmptyFollowUpsProps> = ({ activeTab }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
      <p className="text-muted-foreground">
        No {activeTab === "today" ? "follow-ups scheduled for today" : 
            activeTab === "week" ? "follow-ups this week" : 
            "pending follow-ups"}
      </p>
    </div>
  );
};

export default EmptyFollowUps;
