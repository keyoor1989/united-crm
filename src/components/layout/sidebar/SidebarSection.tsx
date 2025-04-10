
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

type SidebarSectionProps = {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

const SidebarSection = ({ 
  icon, 
  label, 
  isActive, 
  isOpen, 
  onToggle, 
  children 
}: SidebarSectionProps) => {
  return (
    <div className="flex flex-col">
      <button 
        onClick={onToggle} 
        className={cn(
          "sidebar-item", 
          isActive && "active",
          "cursor-pointer"
        )}
      >
        {icon}
        <span className="text-sm font-medium">{label}</span>
        {isOpen ? <ChevronDown size={16} className="ml-auto" /> : <ChevronRight size={16} className="ml-auto" />}
      </button>
      
      {isOpen && (
        <div className="pl-8 flex flex-col gap-1 mt-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default SidebarSection;
