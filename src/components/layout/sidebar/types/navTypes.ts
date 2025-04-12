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

// Keep backward compatibility with the NavSection type
export type NavSection = {
  key: string;
  icon: LucideIcon;
  label: string;
  items: NavItem[];
};
