
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

// Update NavSection to include both label and title properties for compatibility
export type NavSection = {
  key: string;
  icon: LucideIcon;
  label: string;
  title?: string; // Add title property for compatibility with SidebarSectionConfig
  items: NavItem[];
};
