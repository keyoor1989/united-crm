
import { 
  Package, Boxes, Tag, Store, ShoppingCart, Send, ArrowRightLeft, 
  Building, RotateCcw, Cpu, BarChart2, Award, 
  History, AlertTriangle, ShoppingBag 
} from "lucide-react";
import { NavSection } from "../types/navTypes";

export const inventorySection: NavSection = {
  key: "inventory",
  icon: Package,
  label: "Inventory",
  items: [
    {
      to: "/inventory",
      icon: Boxes,
      label: "Dashboard"
    },
    {
      to: "/inventory/brands",
      icon: Tag,
      label: "Brands & Models"
    },
    {
      to: "/inventory/items",
      icon: Package,
      label: "Item Master"
    },
    {
      to: "/inventory/vendors",
      icon: Store,
      label: "Vendor Management"
    },
    {
      to: "/inventory/purchase",
      icon: ShoppingCart,
      label: "Purchase Entry"
    },
    {
      to: "/inventory/sales",
      icon: ShoppingBag,
      label: "Sales Management"
    },
    {
      to: "/inventory/issue",
      icon: Send,
      label: "Issue Entry"
    },
    {
      to: "/inventory/transfer",
      icon: ArrowRightLeft,
      label: "Warehouse Transfer"
    },
    {
      to: "/inventory/branch-transfer",
      icon: Building,
      label: "Branch Transfer"
    },
    {
      to: "/inventory/returns",
      icon: RotateCcw,
      label: "Returns & Replacements"
    },
    {
      to: "/inventory/machine-parts",
      icon: Cpu,
      label: "Machine Parts Usage"
    },
    {
      to: "/inventory/profit-report",
      icon: BarChart2,
      label: "Profit Report"
    },
    {
      to: "/inventory/vendor-performance-metrics",
      icon: Award,
      label: "Vendor Metrics Demo"
    },
    {
      to: "/inventory/history",
      icon: History,
      label: "Stock History"
    },
    {
      to: "/inventory/alerts",
      icon: AlertTriangle,
      label: "Low Stock Alerts"
    }
  ]
};
