import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Filter,
  Plus,
  Search,
  ShoppingBag,
  Download,
  CreditCard,
  Calendar,
  IndianRupee,
  Receipt,
  FileText,
  Printer,
  Wallet,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const salesData = [
  {
    id: "S001",
    date: "2025-04-01",
    customer: "ABC Corporation",
    customerType: "Dealer",
    itemName: "Kyocera TK-1175 Toner",
    quantity: 5,
    unitPrice: 3500,
    total: 17500,
    status: "Completed",
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    billGenerated: true,
    invoiceNumber: "INV-2025-001"
  },
  {
    id: "S002",
    date: "2025-03-28",
    customer: "XYZ Ltd",
    customerType: "Customer",
    itemName: "Canon NPG-59 Drum",
    quantity: 2,
    unitPrice: 4200,
    total: 8400,
    status: "Pending",
    paymentMethod: "Bank Transfer",
    paymentStatus: "Pending",
    billGenerated: true,
    invoiceNumber: "INV-2025-002"
  },
  {
    id: "S003",
    date: "2025-03-25",
    customer: "Tech Solutions",
    customerType: "Dealer",
    itemName: "Ricoh SP 210 Toner",
    quantity: 8,
    unitPrice: 2400,
    total: 19200,
    status: "Completed",
    paymentMethod: "Cash",
    paymentStatus: "Paid",
    billGenerated: false,
    invoiceNumber: null
  },
  {
    id: "S004",
    date: "2025-03-22",
    customer: "City Hospital",
    customerType: "Government",
    itemName: "HP CF217A Toner",
    quantity: 10,
    unitPrice: 1800,
    total: 18000,
    status: "Completed",
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    billGenerated: true,
    invoiceNumber: "INV-2025-003"
  },
  {
    id: "S005",
    date: "2025-03-20",
    customer: "Global Enterprises",
    customerType: "Customer",
    itemName: "Xerox 3020 Drum Unit",
    quantity: 3,
    unitPrice: 3500,
    total: 10500,
    status: "Credit Sale",
    paymentMethod: "Credit",
    paymentStatus: "Due",
    billGenerated: true,
    invoiceNumber: "INV-2025-004",
    dueDate: "2025-04-20"
  },
];

const productCategories = [
  "Toner",
  "Drum",
  "Spare Parts",
  "Copier Machine",
  "Printer",
  "Finishing Machine"
];

const paymentMethods = [
  { value: "cash", label: "Cash", icon: Wallet },
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  { value: "upi", label: "UPI", icon: IndianRupee },
  { value: "credit", label: "Credit (Due Payment)", icon: Calendar },
];

const customerTypes = [
  { value: "customer", label: "Regular Customer" },
  { value: "dealer", label: "Dealer" },
  { value: "government", label: "Government" },
];

const InventorySales = () => {
  // ... rest of the existing code remains the same
};

export default InventorySales;
