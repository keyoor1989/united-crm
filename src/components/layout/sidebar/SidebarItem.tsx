
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type SidebarItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
};

const SidebarItem = ({ to, icon, label, isActive }: SidebarItemProps) => {
  return (
    <Link to={to} className={cn("sidebar-item", isActive && "active")}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

export default SidebarItem;
