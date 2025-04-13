
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FollowUpTabsProps {
  activeTab: "today" | "week" | "all" | "completed";
  setActiveTab: (tab: "today" | "week" | "all" | "completed") => void;
  children?: React.ReactNode; // Add children prop to render content
}

const FollowUpTabs: React.FC<FollowUpTabsProps> = ({ activeTab, setActiveTab, children }) => {
  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="today">Today</TabsTrigger>
        <TabsTrigger value="week">This Week</TabsTrigger>
        <TabsTrigger value="all">All Pending</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export default FollowUpTabs;
