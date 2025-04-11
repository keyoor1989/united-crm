
import { 
  Users, 
  UserPlus, 
  List, 
  Calendar 
} from "lucide-react";

export const customersSection = {
  label: "Customers",
  icon: Users,
  to: "/customers",
  items: [
    {
      label: "Customer List",
      icon: List,
      to: "/customers",
    },
    {
      label: "Add Customer",
      icon: UserPlus,
      to: "/customer-form",
    },
    {
      label: "Follow-Up Reminders",
      icon: Calendar,
      to: "/customers/follow-ups",
    }
  ]
};
