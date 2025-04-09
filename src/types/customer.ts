
export type CustomerStatus = "Active" | "Contract Renewal" | "Need Toner" | "Inactive" | "Prospect";

export interface CustomerType {
  id: number;
  name: string;
  lastContact: string;
  phone: string;
  email: string;
  location: string;
  machines: string[];
  status: CustomerStatus;
}
