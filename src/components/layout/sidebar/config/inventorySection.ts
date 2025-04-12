
import { 
  Package, 
  Truck, 
  Warehouse, 
  Store, 
  QrCode, 
  SendToBack,
  Box,
  Receipt,
  CheckSquare,
  BarChart2,
  Clipboard
} from "lucide-react";
import { SidebarSectionConfig } from "../types/navTypes";

export const inventorySection: SidebarSectionConfig = {
  title: "Inventory",
  icon: Package,
  items: [
    {
      to: "/inventory",
      icon: Package,
      label: "Inventory Dashboard"
    },
    {
      to: "/inventory/items",
      icon: Box,
      label: "Inventory Items"
    },
    {
      to: "/inventory/machine-parts",
      icon: QrCode,
      label: "Machine Parts"
    },
    {
      to: "/inventory/brands",
      icon: Clipboard,
      label: "Brands & Models"
    },
    {
      to: "/inventory/warehouses",
      icon: Warehouse,
      label: "Warehouses"
    },
    {
      to: "/inventory/vendors",
      icon: Store,
      label: "Vendors"
    },
    {
      to: "/inventory/vendor-performance",
      icon: BarChart2,
      label: "Vendor Performance"
    },
    {
      to: "/inventory/purchase-entry",
      icon: Receipt,
      label: "Purchase Entry"
    },
    {
      to: "/inventory/issue",
      icon: SendToBack,
      label: "Issue Entry"
    },
    {
      to: "/inventory/transfers",
      icon: Truck,
      label: "Stock Transfers"
    },
    {
      to: "/inventory/profit-report",
      icon: BarChart2,
      label: "Profit Report"
    },
    {
      to: "/service-inventory",
      icon: CheckSquare,
      label: "Service Inventory"
    }
  ]
};
