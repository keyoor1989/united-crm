
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

  // Enhanced name extraction with improved patterns
  const namePatterns = [
    /Name\s+([^,\n]+)/i,
    /Customer\s+([^,\n]+)/i,
    /(?:new customer|add customer|create lead|naya customer)[:\s]+([A-Za-z\s]+)(?=[,\s]|$)/i,
    /([A-Za-z]+\s+[A-Za-z]+)(?=[,\s]|from\s)/i,
    /name[:\s]+([A-Za-z\s]+)(?=[,\s]|$)/i,
    /customer[:\s]+([A-Za-z\s]+)(?=[,\s]|$)/i
  ];
  
  for (const pattern of namePatterns) {
    const nameMatch = command.match(pattern);
    if (nameMatch && nameMatch[1]) {
      result.name = nameMatch[1].trim();
      console.log("Extracted name:", result.name);
      break;
    }
  }
  
  // If name not found with patterns, try to find first segment that could be a name
  if (!result.name) {
    // Try to extract the name after "add customer" or similar phrases
    const addCustomerMatch = command.match(/(?:add|new)\s+customer\s+([^,\d]+)/i);
    if (addCustomerMatch && addCustomerMatch[1]) {
      result.name = addCustomerMatch[1].trim();
      console.log("Extracted name from add customer phrase:", result.name);
    } else {
      // Try to extract the first segment that looks like a name
      const words = command.split(/[\s,]+/);
      // Skip common command words
      const skipWords = ['add', 'new', 'customer', 'create', 'lead'];
      let nameCandidate = '';
      
      for (let i = 0; i < words.length; i++) {
        if (!skipWords.includes(words[i].toLowerCase()) && 
            /^[A-Za-z]+$/.test(words[i]) && 
            words[i].length > 2) {
          // If we find a word that looks like a name, check if next word could be a last name
          if (i + 1 < words.length && 
              /^[A-Za-z]+$/.test(words[i+1]) && 
              words[i+1].length > 2) {
            nameCandidate = words[i] + ' ' + words[i+1];
            i++; // Skip the next word since we used it as last name
          } else {
            nameCandidate = words[i];
          }
          break;
        }
      }
      
      if (nameCandidate) {
        result.name = nameCandidate;
        console.log("Extracted name from word analysis:", result.name);
      }
    }
  }
  
  if (!result.name) {
    result.missingFields.push("name");
    console.log("Name not found in command");
  }

  // Enhanced phone number extraction with multiple patterns
  const phonePatterns = [
    /Mobile\s+(\d{10})/i,
    /Phone\s+(\d{10})/i,
    /(?:number|mobile|phone|contact|call)[:\s]*(\d{10})/i,
    /(?:number|mobile|phone|contact|call)[:\s]*(\d{3}[ -]?\d{3}[ -]?\d{4})/i,
    /(\d{10})(?=[,\s]|$)/i,
    /\b(\d{10})\b/  // Standalone 10-digit number
  ];
  
  for (const pattern of phonePatterns) {
    const phoneMatch = command.match(pattern);
    if (phoneMatch && phoneMatch[1]) {
      result.phone = phoneMatch[1].replace(/\D/g, '');
      console.log("Extracted phone:", result.phone);
      break;
    }
  }
  
  // If no phone found, try to find any 10-digit number in the text
  if (!result.phone) {
    const digitsOnly = command.replace(/\D/g, ' ');
    const numberMatches = digitsOnly.match(/\b\d{10}\b/g);
    if (numberMatches && numberMatches.length > 0) {
      result.phone = numberMatches[0];
      console.log("Extracted phone from digits only:", result.phone);
    }
  }
  
  if (!result.phone) {
    result.missingFields.push("phone");
    console.log("Phone not found in command");
  }

  // Enhanced location/city extraction with multiple patterns
  const locationPatterns = [
    /City\s+([^,\n]+)/i,
    /Area\s+([^,\n]+)/i,
    /(?:from|in|at)\s+([A-Za-z]+)(?=[,\s]|$)/i,
    /(?:location|city|address)[:\s]+([A-Za-z]+)(?=[,\s]|$)/i,
    /([A-Za-z]+)\s+(?:city|area)/i
  ];
  
  for (const pattern of locationPatterns) {
    const locationMatch = command.match(pattern);
    if (locationMatch && locationMatch[1]) {
      result.location = locationMatch[1].trim();
      console.log("Extracted location:", result.location);
      break;
    }
  }
  
  // If location not found, check for common Indian city names
  if (!result.location) {
    const commonCities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
      'Pune', 'Jaipur', 'Lucknow', 'Ahmedabad', 'Bhopal', 'Indore',
      'Chandigarh', 'Nagpur', 'Patna', 'Surat', 'Vadodara', 'Kochi'
    ];
    
    for (const city of commonCities) {
      if (command.includes(city) || command.includes(city.toLowerCase())) {
        result.location = city;
        console.log("Extracted location from common cities list:", result.location);
        break;
      }
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

  // Enhanced product interest extraction with multiple patterns
  const productPatterns = [
    /Interested\s+In\s+([^,\n]+)/i,
    /Intrested\s+In\s+([^,\n]+)/i,  // Common misspelling
    /Looking\s+For\s+([^,\n]+)/i,
    /Needs\s+([^,\n]+)/i,
    /(?:interested in|looking for|enquiry for|enquiry|wants)[:\s]+([A-Za-z0-9\s]+)(?=[,\s]|$)/i,
    /(?:product|machine|equipment)[:\s]+([A-Za-z0-9\s]+)(?=[,\s]|$)/i,
    /(?:needs|requires)[:\s]+([A-Za-z0-9\s]+)(?=[,\s]|$)/i
  ];
  
  for (const pattern of productPatterns) {
    const productMatch = command.match(pattern);
    if (productMatch && productMatch[1]) {
      result.product = productMatch[1].trim();
      console.log("Extracted product:", result.product);
      break;
    }
  }

  // Check for spare parts specifically
  if (command.toLowerCase().includes("spare part") || command.toLowerCase().includes("spare parts")) {
    result.product = result.product || "Spare Parts";
    console.log("Detected spare parts inquiry");
  }

  // Determine if the command has enough information
  result.isValid = Boolean(result.name && result.phone && result.location);
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
