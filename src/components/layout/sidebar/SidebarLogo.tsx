
import React from "react";

const SidebarLogo = () => {
  return (
    <div className="p-4 border-b border-sidebar-border flex items-center gap-2">
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/01eb2522-9319-4441-8cce-7f1a4ed92ed8.png" 
          alt="United Copier" 
          className="h-10 w-auto" 
        />
      </div>
      <div className="flex flex-col ml-2">
        <h1 className="font-bold text-lg text-sidebar-foreground">
          United Copier
        </h1>
        <span className="text-xs text-sidebar-foreground/70">Center</span>
      </div>
    </div>
  );
};

export default SidebarLogo;
