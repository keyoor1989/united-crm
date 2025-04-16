
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
  console.log("Parsing customer command:", command);
  
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

  // Extract name with multiple pattern matching for improved flexibility
  const namePatterns = [
    /(?:new customer|add customer|create lead|naya customer|add new customer)[:\s]+([A-Za-z\s]+)(?=[,\s]|$)/i,
    /([A-Za-z]+\s+[A-Za-z]+)(?=[,\s]|from\s)/i,
    /name[:\s]+([A-Za-z\s]+)(?=[,\s]|$)/i,
    /customer[:\s]+([A-Za-z\s]+)(?=[,\s]|$)/i,
    /Name\s+([^,\n]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const nameMatch = command.match(pattern);
    if (nameMatch && nameMatch[1]) {
      result.name = nameMatch[1].trim();
      console.log("Extracted name:", result.name);
      break;
    }
  }
  
  if (!result.name) {
    result.missingFields.push("name");
    console.log("Name not found in command");
  }

  // Extract phone number with enhanced pattern matching
  const phonePatterns = [
    /(?:number|mobile|phone|contact|call)[:\s]*(\d{10}|\d{4}[ -]?\d{3}[ -]?\d{3}|\d{3}[ -]?\d{3}[ -]?\d{4})/i,
    /(\d{10})(?=[,\s]|$)/i,
    /mobile[:\s]*(\d{10})/i,
    /phone[:\s]*(\d{10})/i,
    /Mobile\s+(\d{10})/i,
    /Phone\s+(\d{10})/i
  ];
  
  for (const pattern of phonePatterns) {
    const phoneMatch = command.match(pattern);
    if (phoneMatch && phoneMatch[1]) {
      result.phone = phoneMatch[1].replace(/\D/g, '');
      console.log("Extracted phone:", result.phone);
      break;
    }
  }
  
  if (!result.phone) {
    result.missingFields.push("phone");
    console.log("Phone not found in command");
  }

  // Extract location/city with multiple patterns
  const locationPatterns = [
    /(?:from|in|at)\s+([A-Za-z]+)(?=[,\s]|$)/i,
    /(?:location|city|address)[:\s]+([A-Za-z]+)(?=[,\s]|$)/i,
    /([A-Za-z]+)\s+(?:city|area)/i,
    /City\s+([^,\n]+)/i,
    /Area\s+([^,\n]+)/i
  ];
  
  for (const pattern of locationPatterns) {
    const locationMatch = command.match(pattern);
    if (locationMatch && locationMatch[1]) {
      result.location = locationMatch[1].trim();
      console.log("Extracted location:", result.location);
      break;
    }
  }
  
  if (!result.location) {
    result.missingFields.push("location");
    console.log("Location not found in command");
  }

  // Extract email (optional)
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = command.match(emailRegex);
  
  if (emailMatch) {
    result.email = emailMatch[0];
    console.log("Extracted email:", result.email);
  }

  // Extract product interest with multiple patterns (optional)
  const productPatterns = [
    /(?:interested in|looking for|enquiry for|enquiry|wants)[:\s]+([A-Za-z0-9\s]+)(?=[,\s]|$)/i,
    /(?:product|machine|equipment)[:\s]+([A-Za-z0-9\s]+)(?=[,\s]|$)/i,
    /(?:needs|requires)[:\s]+([A-Za-z0-9\s]+)(?=[,\s]|$)/i,
    /Interested\s+In\s+([^,\n]+)/i
  ];
  
  for (const pattern of productPatterns) {
    const productMatch = command.match(pattern);
    if (productMatch && productMatch[1]) {
      result.product = productMatch[1].trim();
      console.log("Extracted product:", result.product);
      break;
    }
  }

  // Check if this is potentially a spare parts inquiry
  if (command.toLowerCase().includes("spare part") || command.toLowerCase().includes("spare parts")) {
    result.product = result.product || "Spare Parts";
    console.log("Detected spare parts inquiry");
  }

  // Determine if the command has enough information
  result.isValid = result.name !== "" && result.phone !== "" && result.location !== "";
  console.log("Command is valid:", result.isValid, "Missing fields:", result.missingFields);

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
