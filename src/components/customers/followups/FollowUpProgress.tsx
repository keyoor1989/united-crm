
import React from "react";
import { Progress } from "@/components/ui/progress";

interface FollowUpProgressProps {
  todayCompleted: number;
  todayTotal: number;
  todayProgress: number;
}

const FollowUpProgress: React.FC<FollowUpProgressProps> = ({ 
  todayCompleted, 
  todayTotal, 
  todayProgress 
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center text-sm mb-1">
        <span>Today's progress</span>
        <span>{todayCompleted} of {todayTotal} completed</span>
      </div>
      <Progress value={todayProgress} className="h-2" />
    </div>
  );
};

export default FollowUpProgress;
