
import { Box, CircleDollarSign, CreditCard, BarChart3, Package, Truck, History, Building2, ReceiptText, Tags, Archive } from "lucide-react";
import { NavSection } from "../types/navTypes";

export const inventorySection: NavSection = {
  key: "inventory",
  label: "Inventory",
  icon: Box,
  items: [
    {
      to: "/inventory/items",
      icon: Package,
      label: "Items"
    },
    {
      to: "/inventory/brands",
      icon: Tags,
      label: "Brands & Models"
    },
    {
      to: "/inventory/vendors",
      icon: Truck,
      label: "Vendors"
    },
    {
      to: "/inventory/warehouses",
      icon: Building2,
      label: "Warehouses"
    },
    {
      to: "/inventory/cash-purchase",
      icon: CircleDollarSign,
      label: "Cash Purchase"
    },
    {
      to: "/inventory/sales",
      icon: ReceiptText,
      label: "Sales"
    },
    {
      to: "/inventory/credit-sales",
      icon: CreditCard,
      label: "Credit Sales"
    },
    {
      to: "/inventory/sales-reports",
      icon: BarChart3,
      label: "Sales Reports"
    },
    {
      to: "/inventory/machine-parts",
      icon: Archive,
      label: "Machine Parts"
    },
    {
      to: "/inventory/transfers",
      icon: History,
      label: "History"
    }
  ]
};
