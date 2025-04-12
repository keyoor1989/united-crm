
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
}

export interface Feedback {
  rating: number;
  comment: string | null;
  date: string;
}
