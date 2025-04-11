
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
  customerId: number;
  customerName: string;
  notes: string;
  status: "pending" | "completed";
  type: "quotation" | "demo" | "negotiation" | "closure";
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
  notes?: string;
  status: "pending" | "completed";
  type: "quotation" | "demo" | "negotiation" | "closure";
}
