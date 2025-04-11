
import { 
  BarChart3, Printer, Wrench, MessageSquare, Building, 
  BadgeDollarSign, TrendingUp, LineChart 
} from "lucide-react";
import { NavSection } from "../types/navTypes";

export const reportsSection: NavSection = {
  key: "reports",
  icon: BarChart3,
  label: "Reports",
  items: [
    {
      to: "/reports",
      icon: BarChart3,
      label: "Reports Dashboard"
    },
    {
      to: "/reports/machine-rental",
      icon: Printer,
      label: "Machine Rental Report"
    },
    {
      to: "/reports/engineer-service",
      icon: Wrench,
      label: "Engineer Service Report"
    },
    {
      to: "/reports/customer-followup",
      icon: MessageSquare,
      label: "Customer Follow-Up Report"
    },
    {
      to: "/reports/branch-profit",
      icon: Building,
      label: "Branch P&L Report"
    },
    {
      to: "/finance/revenue",
      icon: BadgeDollarSign,
      label: "Revenue Reports"
    },
    {
      to: "/inventory/profit-report",
      icon: TrendingUp,
      label: "Inventory Profit Report"
    },
    {
      to: "/engineer-performance",
      icon: LineChart,
      label: "Engineer Performance"
    }
  ]
};
