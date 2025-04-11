
import { LayoutDashboard, Users, CreditCard, BarChart3, CheckSquare, Bot, Settings } from "lucide-react";
import { NavItem } from "../types/navTypes";

export const mainNavItems: NavItem[] = [
  {
    to: "/",
    icon: LayoutDashboard,
    label: "Dashboard"
  },
  {
    to: "/customers",
    icon: Users,
    label: "Customers"
  },
  {
    to: "/finance",
    icon: CreditCard,
    label: "Finance Dashboard"
  },
  {
    to: "/reports",
    icon: BarChart3,
    label: "Reports"
  },
  {
    to: "/tasks",
    icon: CheckSquare,
    label: "Tasks"
  },
  {
    to: "/command-copilot",
    icon: Bot,
    label: "Command Copilot"
  },
  {
    to: "/settings",
    icon: Settings,
    label: "Settings"
  }
];
