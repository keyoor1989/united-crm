
export type CustomerStatus = "Active" | "Contract Renewal" | "Need Toner" | "Inactive" | "Prospect";

export interface CustomerType {
  id: string; // Changed from number to string to match UUID from Supabase
  name: string;
  lastContact: string;
  phone: string;
  email: string;
  location: string;
  machines: string[];
  status: CustomerStatus;
  machineDetails?: any[]; // Add machineDetails property to fix the build errors
}
