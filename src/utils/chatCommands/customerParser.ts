
import { CustomerType, CustomerStatus } from "@/types/customer";
import { v4 as uuidv4 } from "uuid";

export interface ParsedCustomerCommand {
  name: string;
  phone: string;
  location: string;
  email?: string;
  product?: string;
  leadSource: string;
  status: CustomerStatus;
  isValid: boolean;
  missingFields: string[];
}

export const parseCustomerCommand = (command: string): ParsedCustomerCommand => {
  const result: ParsedCustomerCommand = {
    name: "",
    phone: "",
    location: "",
    email: "",
    product: "",
    leadSource: "Chatbot",
    status: "Prospect",
    isValid: false,
    missingFields: [],
  };

  // Extract name
  const nameRegex = /(?:new customer|add customer|create lead|naya customer|add new customer)[:\s]+([A-Za-z\s]+)(?=[,\s]|$)/i;
  const nameMatch = command.match(nameRegex) || command.match(/([A-Za-z]+\s+[A-Za-z]+)(?=[,\s]|from\s)/i);
  
  if (nameMatch && nameMatch[1]) {
    result.name = nameMatch[1].trim();
  } else {
    result.missingFields.push("name");
  }

  // Extract phone number
  const phoneRegex = /(?:number|mobile|phone|contact|call)?\s*:?\s*(\d{10}|\d{4}[ -]?\d{3}[ -]?\d{3}|\d{3}[ -]?\d{3}[ -]?\d{4})/i;
  const phoneMatch = command.match(phoneRegex);
  
  if (phoneMatch && phoneMatch[1]) {
    result.phone = phoneMatch[1].replace(/\D/g, '');
  } else {
    result.missingFields.push("phone");
  }

  // Extract location/city
  const locationRegex = /(?:from|in|at)\s+([A-Za-z]+)(?=[,\s]|$)/i;
  const locationMatch = command.match(locationRegex);
  
  if (locationMatch && locationMatch[1]) {
    result.location = locationMatch[1].trim();
  } else {
    result.missingFields.push("location");
  }

  // Extract email (optional)
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = command.match(emailRegex);
  
  if (emailMatch) {
    result.email = emailMatch[0];
  }

  // Extract product interest (optional)
  const productRegex = /(?:interested in|looking for|enquiry for|enquiry|wants)\s+([A-Za-z0-9\s]+)(?=[,\s]|$)/i;
  const productMatch = command.match(productRegex);
  
  if (productMatch && productMatch[1]) {
    result.product = productMatch[1].trim();
  }

  // Check if this is potentially a spare parts inquiry
  if (command.toLowerCase().includes("spare part") || command.toLowerCase().includes("spare parts")) {
    result.product = result.product || "Spare Parts";
  }

  // Determine if the command has enough information
  result.isValid = result.name !== "" && result.phone !== "";

  return result;
};

export const checkDuplicateCustomer = (phone: string, customers: CustomerType[]): CustomerType | null => {
  return customers.find(customer => customer.phone === phone) || null;
};

export const createNewCustomer = (data: ParsedCustomerCommand): CustomerType => {
  return {
    id: uuidv4(), // Using uuidv4() to generate a proper string ID
    name: data.name,
    lastContact: "Just now",
    phone: data.phone,
    email: data.email || "",
    location: data.location,
    machines: data.product ? [data.product] : [],
    status: "Prospect"
  };
};
