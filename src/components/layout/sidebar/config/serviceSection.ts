
import { BarChart3, HelpingHand, PhoneCall, Settings, Wrench, Package } from "lucide-react";
import { SidebarSectionConfig } from "../types/navTypes";

const serviceSection: SidebarSectionConfig = {
  title: "Service",
  icon: Settings,
  items: [
    {
      to: "/service",
      icon: PhoneCall,
      label: "Service Calls"
    },
    {
      to: "/service-call-form",
      icon: HelpingHand,
      label: "New Service Call"
    },
    {
      to: "/service-billing",
      icon: Wrench,
      label: "Service Billing"
    },
    {
      to: "/amc-consumables",
      icon: Package,
      label: "AMC Consumables"
    },
    {
      to: "/engineer-performance",
      icon: BarChart3,
      label: "Engineer Performance"
    }
  ]
};

export default serviceSection;
