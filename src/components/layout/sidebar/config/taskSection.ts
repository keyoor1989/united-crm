
import { CheckSquare } from "lucide-react";
import { NavSection } from "../types/navTypes";

export const taskSection: NavSection = {
  key: "tasks",
  icon: CheckSquare,
  label: "Tasks",
  items: [
    {
      to: "/tasks",
      icon: CheckSquare,
      label: "Task Dashboard"
    }
  ]
};
