
import { LucideIcon } from "lucide-react";

export type NavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
};

export type SidebarSectionConfig = {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
};
