
import { Wrench, LineChart, User, FileCheck } from "lucide-react";
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
    },
    {
      to: "/inventory/engineer-inventory",
      icon: User,
      label: "Engineer Inventory"
    },
    {
      to: "/inventory/amc-tracker",
      icon: FileCheck,
      label: "AMC Consumables"
    }
  ]
};
