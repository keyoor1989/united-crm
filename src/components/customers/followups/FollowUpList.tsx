
import React from "react";
import { SalesFollowUp } from "../machines/types";
import FollowUpItem from "./FollowUpItem";
import EmptyFollowUps from "./EmptyFollowUps";

interface FollowUpListProps {
  followUps: SalesFollowUp[];
  activeTab: "today" | "week" | "all" | "completed";
  onMarkComplete: (id: number) => void;
}

const FollowUpList: React.FC<FollowUpListProps> = ({ 
  followUps,
  activeTab, 
  onMarkComplete 
}) => {
  if (followUps.length === 0) {
    // Using type assertion to handle the "completed" value
    return <EmptyFollowUps activeTab={activeTab as any} />;
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
      {followUps.map((followUp) => (
        <FollowUpItem 
          key={followUp.id}
          followUp={followUp} 
          onMarkComplete={onMarkComplete} 
        />
      ))}
    </div>
  );
};

export default FollowUpList;
