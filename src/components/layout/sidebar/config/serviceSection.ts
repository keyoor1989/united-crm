import { BarChart3, HelpingHand, PhoneCall, Settings, Wrench } from "lucide-react";
import { SidebarSectionConfig } from "../types/navTypes";

const serviceSection: SidebarSectionConfig = {
  title: "Service",
  icon: <Settings className="h-5 w-5" />,
  items: [
    {
      to: "/service",
      icon: <PhoneCall className="h-5 w-5" />,
      label: "Service Calls"
    },
    {
      to: "/service-call-form",
      icon: <HelpingHand className="h-5 w-5" />,
      label: "New Service Call"
    },
    {
      to: "/service-billing",
      icon: <Wrench className="h-5 w-5" />,
      label: "Service Billing"
    },
    {
      to: "/engineer-performance",
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Engineer Performance"
    }
  ]
};

export default serviceSection;
