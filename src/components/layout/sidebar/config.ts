
import { mainNavItems } from "./config/mainNavItems";
import { customersSection } from "./config/customersSection";
import { inventorySection } from "./config/inventorySection";
import serviceSection from "./config/serviceSection";
import { reportsSection } from "./config/reportsSection";
import { quotationsSection } from "./config/quotationsSection";
import { taskSection } from "./config/taskSection";
import { Settings, MessageSquareText } from "lucide-react";

// Export all configuration items
export { 
  mainNavItems, 
  serviceSection, 
  inventorySection,
  quotationsSection,
  reportsSection,
  taskSection,
  customersSection
};

// Define locationNavItems here since it was missing
export const locationNavItems = [
  // Add location navigation items if needed
];

export const sidebarSections = [
  {
    title: "",
    items: mainNavItems,
  },
  customersSection,
  serviceSection,
  inventorySection,
  quotationsSection,
  taskSection,
  reportsSection,
  {
    title: "Settings",
    items: [
      {
        title: "Telegram Bot",
        href: "/telegram-admin",
        icon: MessageSquareText,
        items: [],
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        items: [],
      },
    ],
  },
];
