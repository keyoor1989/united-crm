
import { CustomerType } from "@/types/customer";

export const parsePhoneNumberCommand = (command: string): string | null => {
  // Clean up the command to extract just the phone number
  const cleanCommand = command.trim().toLowerCase();
  
  // Check if this is an explicit lookup command
  const explicitLookupRegex = /(?:check|find|lookup|search|show)(?:\s+customer|\s+mobile|\s+number)?[\s:]+((?:\+?91\s?)?\d{10})/i;
  const explicitMatch = command.match(explicitLookupRegex);
  if (explicitMatch && explicitMatch[1]) {
    return explicitMatch[1].replace(/\D/g, '').slice(-10);
  }
  
  // Match standard 10-digit Indian phone numbers, potentially with country code
  const phoneRegex = /(\+?91\s?)?(\d{10}|\d{4}[ -]?\d{3}[ -]?\d{3}|\d{3}[ -]?\d{3}[ -]?\d{4})/;
  
  // Check if the command is just a phone number
  const phoneMatch = cleanCommand.match(phoneRegex);
  if (phoneMatch) {
    // Extract the actual phone number part and remove any non-digit characters
    const phoneNumber = phoneMatch[0].replace(/\D/g, '');
    // Make sure it's at least 10 digits (for Indian numbers)
    if (phoneNumber.length >= 10) {
      // Return the last 10 digits in case there's a country code
      return phoneNumber.slice(-10);
    }
  }
  
  return null;
};

export const findCustomerByPhone = (phone: string, customers: CustomerType[]): CustomerType | null => {
  // Clean up the phone number to ensure consistent format
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  
  // Find the customer with a matching phone number
  return customers.find(customer => {
    const customerPhone = customer.phone.replace(/\D/g, '').slice(-10);
    return customerPhone === cleanPhone;
  }) || null;
};
