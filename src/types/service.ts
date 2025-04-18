import { ServiceExpense } from "@/types/serviceExpense";

export interface ServiceCall {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  machineId: string;
  machineModel: string;
  serialNumber: string;
  location: string;
  issueType: string;
  issueDescription: string;
  callType: string;
  priority: string;
  status: string;
  engineerId: string | null;
  engineerName: string;
  createdAt: string;
  slaDeadline: string;
  startTime: string | null;
  completionTime: string | null;
  partsUsed: Part[];
  feedback: Feedback | null;
  serviceCharge: number;
  isPaid: boolean;
  paymentDate?: string;
  paymentMethod?: string;
  partsReconciled: boolean;
  expenses?: ServiceExpense[];
  totalExpenses?: number;
  partsCost?: number;
  totalRevenue?: number;
  profit?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  type: string;
  contractType: string;
  status: string;
}

export interface Machine {
  id: string;
  customerId: string;
  model: string;
  serialNumber: string;
  installDate: string;
  status: string;
  lastService: string;
  contractType: string;
}

export type EngineerStatus = "Available" | "On Call" | "On Leave" | "At Warehouse" | "Busy";
export type EngineerSkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface Engineer {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  status: EngineerStatus;
  skillLevel: EngineerSkillLevel;
  currentJob: string | null;
  currentLocation: string;
  leaveEndDate?: string;
}

export interface Part {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  price: number;
  cost?: number;
  profit?: number;
  isReconciled?: boolean;
}

export interface Feedback {
  rating: number;
  comment: string | null;
  date: string;
}

export interface EngineerItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  modelNumber: string | null;
  modelBrand: string | null;
  warehouseSource: string | null;
  engineer_id?: string;
  engineer_name?: string;
  return_date?: string;
}
