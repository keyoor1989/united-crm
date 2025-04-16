
export type FollowUp = {
  date: Date;
  notes: string;
  type: "service" | "sales";
  status?: "pending" | "completed";
};

export type Machine = {
  id: number | string;
  model: string;
  serialNumber: string;
  installationDate: string;
  status: "active" | "maintenance" | "replacement-due";
  lastService: string;
  followUp?: FollowUp;
};

export type SalesFollowUp = {
  id: number;
  date: Date;
  customerId: number | string;
  customerName: string;
  notes: string | null;
  status: "pending" | "completed";
  type: "quotation" | "demo" | "negotiation" | "closure";
  contactPhone?: string; // Added to store customer's phone for easy contact
  location?: string; // Added to show customer's location
  reminderSent?: boolean; // Flag to track if reminder was sent
};

export interface MachineFormData {
  model: string;
  serialNumber?: string; // Made optional
  machineType: string;
  installationDate?: string; // Made optional
  status: "active" | "maintenance" | "replacement-due";
}

export interface SalesFollowUpFormData {
  date?: Date;
  customerName?: string;
  customerId?: number | string; // Added the missing customerId property
  notes?: string;
  status: "pending" | "completed";
  type: "quotation" | "demo" | "negotiation" | "closure";
  contactPhone?: string; // Added to store customer's phone for easy contact
  location?: string; // Added to show customer's location
}
