
import { BarChart3, HelpingHand, PhoneCall, Settings, Wrench, ClipboardList, Coins } from "lucide-react";
import { NavSection } from "../types/navTypes";

export const serviceSection: NavSection = {
  key: "service",
  label: "Service",
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
      to: "/service-inventory",
      icon: ClipboardList,
      label: "Inventory Management"
    },
    {
      to: "/rental-machines",
      icon: Coins,
      label: "Rental Machines"
    },
    {
      to: "/engineer-performance",
      icon: BarChart3,
      label: "Engineer Performance"
    }
  ]
};

export default serviceSection;
