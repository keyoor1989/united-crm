
import { 
  FileText, FilePlus, SendHorizontal, Clipboard, Upload, 
  ShoppingBasket, FileEdit, Send, ArchiveRestore 
} from "lucide-react";
import { NavSection } from "../types/navTypes";

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
