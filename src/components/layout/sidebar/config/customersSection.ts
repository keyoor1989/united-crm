
import { 
  Users, 
  UserPlus, 
  List, 
  Calendar 
} from "lucide-react";
import { NavSection } from "../types/navTypes";

export const customersSection: NavSection = {
  key: "customers",
  icon: Users,
  label: "Customers",
  items: [
    {
      to: "/customers",
      icon: List,
      label: "Customer List"
    },
    {
      to: "/customer",
      icon: UserPlus,
      label: "Add Customer"
    },
    {
      to: "/customers/follow-ups",
      icon: Calendar,
      label: "Follow-Up Reminders"
    }
  ]
};
