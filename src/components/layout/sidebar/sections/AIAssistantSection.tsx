
import React from "react";
import { NavItem } from "../types/navTypes";
import MainNavItems from "./MainNavItems";

type AIAssistantSectionProps = {
  items: NavItem[];
  isActive: (path: string) => boolean;
  isCollapsed: boolean;
};

const AIAssistantSection = ({ items, isActive, isCollapsed }: AIAssistantSectionProps) => {
  const aiAssistantItems = items.filter(item => 
    item.to === "/smart-assistant"
  );
  
  return (
    <MainNavItems 
      items={aiAssistantItems} 
      isActive={isActive} 
      isCollapsed={isCollapsed} 
    />
  );
};

export default AIAssistantSection;
