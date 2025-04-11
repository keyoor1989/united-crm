
import { Wrench, LineChart } from "lucide-react";
import { NavSection } from "../types/navTypes";

export const serviceSection: NavSection = {
  key: "service",
  icon: Wrench,
  label: "Service",
  items: [
    {
      to: "/service",
      icon: Wrench,
      label: "Service Calls"
    },
    {
      to: "/engineer-performance",
      icon: LineChart,
      label: "Engineer Performance"
    }
  ]
};
