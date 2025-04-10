
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  Package, 
  FileText, 
  CreditCard, 
  BarChart3, 
  CheckSquare, 
  Settings,
  MessageSquare,
  Building,
  LineChart,
  Boxes,
  Tag,
  Package as PackageIcon,
  Store,
  ShoppingCart,
  Send,
  ArrowRightLeft,
  RotateCcw,
  User,
  Cpu,
  BarChart2,
  FileCheck,
  Award,
  History,
  AlertTriangle,
  ShoppingBag
} from "lucide-react";

export type NavItem = {
  to: string;
  icon: any;
  label: string;
};

export type NavSection = {
  key: string;
  icon: any;
  label: string;
  items: NavItem[];
};

export const mainNavItems: NavItem[] = [
  {
    to: "/",
    icon: LayoutDashboard,
    label: "Dashboard"
  },
  {
    to: "/customers",
    icon: Users,
    label: "Customers"
  },
  {
    to: "/quotations",
    icon: FileText,
    label: "Quotations"
  },
  {
    to: "/finance",
    icon: CreditCard,
    label: "Finance"
  },
  {
    to: "/reports",
    icon: BarChart3,
    label: "Reports"
  },
  {
    to: "/tasks",
    icon: CheckSquare,
    label: "Tasks"
  },
  {
    to: "/chat",
    icon: MessageSquare,
    label: "Bot Assistant"
  },
  {
    to: "/settings",
    icon: Settings,
    label: "Settings"
  }
];

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
      icon: PackageIcon,
      label: "Item Master"
    },
    {
      to: "/inventory/vendors",
      icon: Store,
      label: "Vendors"
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
      to: "/inventory/engineer-inventory",
      icon: User,
      label: "Engineer Inventory"
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
      to: "/inventory/amc-tracker",
      icon: FileCheck,
      label: "AMC Consumables"
    },
    {
      to: "/inventory/vendor-performance",
      icon: Award,
      label: "Vendor Performance"
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
