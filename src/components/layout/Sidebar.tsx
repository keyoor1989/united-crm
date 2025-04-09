
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  Package, 
  FileText, 
  CreditCard, 
  BarChart3, 
  CheckSquare, 
  Settings,
  MessageSquare,
  Building,
  LineChart
} from "lucide-react";

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

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen w-64 bg-sidebar fixed left-0 top-0 border-r border-sidebar-border flex flex-col">
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

      <div className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
        <SidebarItem
          to="/"
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          isActive={isActive("/")}
        />
        <SidebarItem
          to="/customers"
          icon={<Users size={20} />}
          label="Customers"
          isActive={isActive("/customers")}
        />
        <SidebarItem
          to="/service"
          icon={<Wrench size={20} />}
          label="Service"
          isActive={isActive("/service")}
        />
        <SidebarItem
          to="/engineer-performance"
          icon={<LineChart size={20} />}
          label="Engineer Performance"
          isActive={isActive("/engineer-performance")}
        />
        <SidebarItem
          to="/inventory"
          icon={<Package size={20} />}
          label="Inventory"
          isActive={isActive("/inventory")}
        />
        <SidebarItem
          to="/quotations"
          icon={<FileText size={20} />}
          label="Quotations"
          isActive={isActive("/quotations")}
        />
        <SidebarItem
          to="/finance"
          icon={<CreditCard size={20} />}
          label="Finance"
          isActive={isActive("/finance")}
        />
        <SidebarItem
          to="/reports"
          icon={<BarChart3 size={20} />}
          label="Reports"
          isActive={isActive("/reports")}
        />
        <SidebarItem
          to="/tasks"
          icon={<CheckSquare size={20} />}
          label="Tasks"
          isActive={isActive("/tasks")}
        />
        <SidebarItem
          to="/chat"
          icon={<MessageSquare size={20} />}
          label="Bot Assistant"
          isActive={isActive("/chat")}
        />

        <div className="mt-4 mb-2 px-3">
          <p className="text-xs font-semibold uppercase text-sidebar-foreground/50">
            Locations
          </p>
        </div>
        
        <SidebarItem
          to="/locations/indore"
          icon={<Building size={20} />}
          label="Indore (HQ)"
          isActive={isActive("/locations/indore")}
        />
        <SidebarItem
          to="/locations/bhopal"
          icon={<Building size={20} />}
          label="Bhopal Office"
          isActive={isActive("/locations/bhopal")}
        />
        <SidebarItem
          to="/locations/jabalpur"
          icon={<Building size={20} />}
          label="Jabalpur Office"
          isActive={isActive("/locations/jabalpur")}
        />
      </div>

      <div className="mt-auto p-4 border-t border-sidebar-border">
        <SidebarItem
          to="/settings"
          icon={<Settings size={20} />}
          label="Settings"
          isActive={isActive("/settings")}
        />
      </div>
    </div>
  );
};

export default Sidebar;
