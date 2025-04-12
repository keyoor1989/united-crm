import {
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Cog6Tooth,
  FilePie,
  GaugeCircle,
  Home,
  ListChecks,
  LucideIcon,
  Mail,
  MessagesSquare,
  PieChart,
  Settings,
  ShoppingBag,
  User,
  Users,
  LayoutDashboard,
  Boxes,
  Tag,
  ShoppingCart,
  ExternalLink,
  Repeat,
  Tool,
  Cpu,
  Layers,
  Box,
  BarChart,
  PieChart as PieChartIcon,
  FileText,
  Wallet,
  Contact2,
  ListOrdered,
  FileSearch2,
  FileSignature,
  ScrollText,
  FileDown,
  BadgePercent,
  KanbanSquare,
  ListTodo,
  AlertCircle,
  File,
  FilePlus2,
  FileEdit,
  FileCheck,
  FileCode2,
  FileJson2,
  FileKey2,
  FileLock2,
  FileTerminal2,
  FileUp,
  FileWarning2,
  FileZip2,
  FileSearch,
  FileSignature as FileSignatureIcon,
  ScrollText as ScrollTextIcon,
  FileDown as FileDownIcon,
  BadgePercent as BadgePercentIcon,
  KanbanSquare as KanbanSquareIcon,
  ListTodo as ListTodoIcon,
  AlertCircle as AlertCircleIcon,
  File as FileIcon,
  FilePlus2 as FilePlus2Icon,
  FileEdit as FileEditIcon,
  FileCheck as FileCheckIcon,
  FileCode2 as FileCode2Icon,
  FileJson2 as FileJson2Icon,
  FileKey2 as FileKey2Icon,
  FileLock2 as FileLock2Icon,
  FileTerminal2 as FileTerminal2Icon,
  FileUp as FileUpIcon,
  FileWarning2 as FileWarning2Icon,
  FileZip2 as FileZip2Icon,
  FileSearch as FileSearchIcon,
  Contact2 as Contact2Icon,
  ListOrdered as ListOrderedIcon,
  Wallet as WalletIcon,
} from "lucide-react";

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

export const mainNavItems: NavItem[] = [
  {
    to: "/",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    to: "/customers",
    icon: Users,
    label: "Customers",
  },
  {
    to: "/finance",
    icon: Wallet,
    label: "Finance",
  },
  {
    to: "/tasks",
    icon: ListChecks,
    label: "Tasks",
  },
  {
    to: "/quotations",
    icon: FileText,
    label: "Quotations",
  },
  {
    to: "/service",
    icon: Cog6Tooth,
    label: "Service",
  },
  {
    to: "/inventory",
    icon: Boxes,
    label: "Inventory",
  },
  {
    to: "/reports",
    icon: FilePie,
    label: "Reports",
  },
  {
    to: "/command-copilot",
    icon: MessagesSquare,
    label: "Command Copilot",
  },
  {
    to: "/smart-assistant",
    icon: Mail,
    label: "Smart Assistant",
  },
];

export const customersSection = {
  title: "Customers",
  id: "customers",
  items: [
    {
      to: "/customers",
      icon: Users,
      label: "Customer List",
    },
    {
      to: "/customers/follow-ups",
      icon: Contact2,
      label: "Customer Follow Ups",
    },
    {
      to: "/customer-form",
      icon: User,
      label: "Add New Customer",
    },
  ],
};

export const taskSection = {
  title: "Tasks",
  id: "tasks",
  items: [
    {
      to: "/tasks",
      icon: KanbanSquare,
      label: "Task Board",
    },
    {
      to: "/tasks/list",
      icon: ListTodo,
      label: "Task List",
    },
    {
      to: "/tasks/calendar",
      icon: Calendar,
      label: "Task Calendar",
    },
  ],
};

export const quotationsSection = {
  title: "Quotations",
  id: "quotations",
  items: [
    {
      to: "/quotations",
      icon: FileText,
      label: "All Quotations",
    },
    {
      to: "/purchase-orders",
      icon: ShoppingBag,
      label: "Purchase Orders",
    },
    {
      to: "/sent-quotations",
      icon: FileSignature,
      label: "Sent Quotations",
    },
    {
      to: "/sent-orders",
      icon: FileCheck,
      label: "Sent Orders",
    },
    {
      to: "/order-history",
      icon: FileSearch,
      label: "Order History",
    },
    {
      to: "/quotation-products",
      icon: Boxes,
      label: "Products",
    },
    {
      to: "/contract-upload",
      icon: FileUp,
      label: "Contract Upload",
    },
  ],
};

export const serviceSection = {
  title: "Service",
  id: "service",
  items: [
    {
      to: "/service",
      icon: ListChecks,
      label: "Service Calls",
    },
    {
      to: "/service-call-form",
      icon: FilePlus2,
      label: "New Service Call",
    },
    {
      to: "/service-billing",
      icon: FileEdit,
      label: "Service Billing",
    },
    {
      to: "/amc-consumables",
      icon: ClipboardList,
      label: "AMC Consumables",
    },
    {
      to: "/service-inventory",
      icon: Boxes,
      label: "Service Inventory",
    },
    {
      to: "/engineer-performance",
      icon: BarChart3,
      label: "Engineer Performance",
    },
  ],
};

export const inventorySection = {
  title: "Inventory",
  id: "inventory",
  items: [
    {
      to: "/inventory",
      icon: Layers,
      label: "Dashboard"
    },
    {
      to: "/inventory/items",
      icon: Box,
      label: "Inventory Items"
    },
    {
      to: "/inventory/brands",
      icon: Tag,
      label: "Brands Management"
    },
    {
      to: "/inventory/purchase-entry",
      icon: ShoppingCart,
      label: "Purchase Entry"
    },
    {
      to: "/inventory/issue",
      icon: ExternalLink,
      label: "Issue Stock"
    },
    {
      to: "/inventory/warehouses",
      icon: Home,
      label: "Warehouses"
    },
    {
      to: "/inventory/transfers",
      icon: Repeat,
      label: "Stock Transfers"
    },
    {
      to: "/inventory/engineer-inventory",
      icon: Tool,
      label: "Engineer Inventory"
    },
    {
      to: "/inventory/machine-parts",
      icon: Cpu,
      label: "Machine Parts"
    },
    {
      to: "/inventory/vendors",
      icon: Users,
      label: "Vendors"
    },
    {
      to: "/inventory/vendor-performance",
      icon: BarChart,
      label: "Vendor Performance"
    },
    {
      to: "/inventory/profit-report",
      icon: PieChartIcon,
      label: "Profit Reports"
    },
    {
      to: "/inventory/amc-tracker",
      icon: ClipboardList,
      label: "AMC Tracker"
    }
  ]
};

export const reportsSection = {
  title: "Reports",
  id: "reports",
  items: [
    {
      to: "/reports/sales",
      icon: PieChart,
      label: "Sales Report",
    },
    {
      to: "/reports/inventory",
      icon: Boxes,
      label: "Inventory Report",
    },
    {
      to: "/reports/customers",
      icon: Users,
      label: "Customer Report",
    },
    {
      to: "/reports/finance",
      icon: Wallet,
      label: "Finance Report",
    },
  ],
};

export const locationNavItems: NavItem[] = [
  {
    to: "/locations",
    icon: Building2,
    label: "Locations",
  },
];

export const settingsNavItems: NavItem[] = [
  {
    to: "/settings/profile",
    icon: User,
    label: "Profile",
  },
  {
    to: "/settings/account",
    icon: Settings,
    label: "Account",
  },
  {
    to: "/settings/notifications",
    icon: Mail,
    label: "Notifications",
  },
];

export const aiAssistantNavItems: NavItem[] = [
  {
    to: "/ai-assistant/chat",
    icon: MessagesSquare,
    label: "Chat",
  },
  {
    to: "/ai-assistant/tasks",
    icon: ListChecks,
    label: "Tasks",
  },
  {
    to: "/ai-assistant/email",
    icon: Mail,
    label: "Email",
  },
];
