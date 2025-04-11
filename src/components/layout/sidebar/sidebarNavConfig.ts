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
  ShoppingBag,
  FilePlus,
  SendHorizontal,
  Clipboard,
  Upload,
  ShoppingBasket,
  FileEdit,
  ArchiveRestore,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Bell,
  PieChart,
  BadgeDollarSign,
  Printer
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

export const quotationsSection: NavSection = {
  key: "quotations",
  icon: FileText,
  label: "Quotations",
  items: [
    {
      to: "/quotations",
      icon: FileText,
      label: "All Quotations"
    },
    {
      to: "/quotation-form",
      icon: FilePlus,
      label: "New Quotation"
    },
    {
      to: "/sent-quotations",
      icon: SendHorizontal,
      label: "Sent Quotations"
    },
    {
      to: "/quotation-products",
      icon: Clipboard,
      label: "Quotation Products"
    },
    {
      to: "/contract-upload",
      icon: Upload,
      label: "Contract Upload"
    },
    {
      to: "/purchase-orders",
      icon: ShoppingBasket,
      label: "Purchase Orders"
    },
    {
      to: "/purchase-order-form",
      icon: FileEdit,
      label: "Create Purchase Order"
    },
    {
      to: "/sent-orders",
      icon: Send,
      label: "Sent Orders"
    },
    {
      to: "/order-history",
      icon: ArchiveRestore,
      label: "Order History"
    }
  ]
};

export const financeSection: NavSection = {
  key: "finance",
  icon: CreditCard,
  label: "Finance",
  items: [
    {
      to: "/finance",
      icon: PieChart,
      label: "Finance Dashboard"
    },
    {
      to: "/finance/cash-register",
      icon: DollarSign,
      label: "Daily Cash Register"
    },
    {
      to: "/finance/revenue",
      icon: TrendingUp,
      label: "Department-wise Revenue"
    },
    {
      to: "/finance/expenses",
      icon: TrendingDown,
      label: "Department-wise Expenses"
    },
    {
      to: "/finance/payments",
      icon: Receipt,
      label: "Dealer/Customer Payments"
    },
    {
      to: "/finance/receivables",
      icon: Bell,
      label: "Pending Receivables"
    }
  ]
};

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
      to: "/finance",
      icon: BadgeDollarSign,
      label: "Financial Reports"
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
