
import { Building } from "lucide-react";
import { NavItem } from "../types/navTypes";

export const locationNavItems: NavItem[] = [
  {
    to: "/locations/indore",
    icon: Building,
    label: "Indore (HQ)"
  },
  {
    to: "/locations/bhopal",
    icon: Building,
    label: "Bhopal Office"
  },
  {
    to: "/locations/jabalpur",
    icon: Building,
    label: "Jabalpur Office"
  }
];
