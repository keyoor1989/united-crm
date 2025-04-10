
import React from "react";

const SidebarLogo = () => {
  return (
    <div className="p-4 border-b border-sidebar-border flex items-center gap-2">
      <div className="bg-brand-500 text-white p-1.5 rounded">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="M15 9h.01" />
          <path d="M15 15h.01" />
          <path d="M9 15h.01" />
        </svg>
      </div>
      <div className="flex flex-col">
        <h1 className="font-bold text-lg text-sidebar-foreground">
          Copier Command
        </h1>
        <span className="text-xs text-sidebar-foreground/70">Center</span>
      </div>
    </div>
  );
};

export default SidebarLogo;
