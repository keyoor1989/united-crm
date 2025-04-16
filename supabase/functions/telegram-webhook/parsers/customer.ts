
// Helper functions for parsing customer-related commands

/**
 * Parse a message to extract customer information
 */
export function parseCustomerCommand(text: string) {
  console.log("Parsing customer message:", text);
  
  const result: any = {
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    product: '',
    isValid: false,
    missingFields: []
  };
  
  // Extract name with multiple patterns
  const namePatterns = [
    /Name\s+([^,\n]+)/i,
    /Customer\s+([^,\n]+)/i,
    /(?:new customer|add customer|create lead)[:\s]+([A-Za-z\s]+)(?=[,\s]|$)/i,
    /([A-Za-z]+\s+[A-Za-z]+)(?=[,\s]|from\s)/i
  ];
  
  for (const pattern of namePatterns) {
    const nameMatch = text.match(pattern);
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
  
  // Enhanced phone number extraction with multiple patterns
  const phonePatterns = [
    /Mobile\s+(\d{10})/i,
    /Phone\s+(\d{10})/i,
    /(?:number|mobile|phone|contact|call)[:\s]*(\d{10})/i,
    /(\d{10})(?=[,\s]|$)/i
  ];
  
  for (const pattern of phonePatterns) {
    const phoneMatch = text.match(pattern);
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
  
  // Extract email (optional)
  const emailMatch = text.match(/Email\s+([^\s,\n]+@[^\s,\n]+)/i) || text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    result.email = emailMatch[0];
    console.log("Extracted email:", result.email);
  }
  
  // Improved address extraction - handles multi-word addresses and commas
  const addressPatterns = [
    /Address\s+(.*?)(?=\s+City|\s+Email|\s+Mobile|\s+Phone|\s+Interested|$)/is,
    /(?:address|location)[:\s]+(.*?)(?=[,\n]|$)/i
  ];
  
  for (const pattern of addressPatterns) {
    const addressMatch = text.match(pattern);
    if (addressMatch && addressMatch[1]) {
      result.address = addressMatch[1].trim();
      console.log("Extracted address:", result.address);
      break;
    }
  }
  
  // For city extraction with multiple patterns
  const cityPatterns = [
    /City\s+(.*?)(?=\s+Email|\s+Mobile|\s+Phone|\s+Interested|$)/is,
    /(?:from|in|at)\s+([A-Za-z]+)(?=[,\s]|$)/i,
    /([A-Za-z]+)\s+(?:city|area)/i,
    /Area\s+([^,\n]+)/i
  ];
  
  for (const pattern of cityPatterns) {
    const cityMatch = text.match(pattern);
    if (cityMatch && cityMatch[1]) {
      // Only take the city name without any additional text after it
      const cityParts = cityMatch[1].split(/[\n\r,]/);
      result.city = cityParts[0].trim();
      console.log("Extracted city:", result.city);
      break;
    }
  }
  
  if (!result.city) {
    result.missingFields.push("city");
    console.log("City not found in command");
  }
  
  // Extract product interest with multiple patterns
  const productPatterns = [
    /Interested\s+In\s+([^,\n]+)/i,
    /Intrested\s+In\s+([^,\n]+)/i,  // Common misspelling
    /Looking\s+For\s+([^,\n]+)/i,
    /Needs\s+([^,\n]+)/i,
    /(?:product|machine|equipment)[:\s]+([A-Za-z0-9\s]+)(?=[,\s]|$)/i,
    /(?:interested in|looking for|enquiry for|enquiry|wants)[:\s]+([A-Za-z0-9\s]+)(?=[,\s]|$)/i
  ];
  
  for (const pattern of productPatterns) {
    const productMatch = text.match(pattern);
    if (productMatch && productMatch[1]) {
      result.product = productMatch[1].trim();
      console.log("Extracted product:", result.product);
      break;
    }
  }
  
  // Check for spare parts specifically
  if (text.toLowerCase().includes("spare part") || text.toLowerCase().includes("spare parts")) {
    result.product = result.product || "Spare Parts";
    console.log("Detected spare parts inquiry");
  }
  
  // Build missing fields list
  if (!result.name) result.missingFields.push("name");
  if (!result.phone) result.missingFields.push("phone");
  if (!result.city) result.missingFields.push("city");
  
  // Mandatory field validation
  result.isValid = Boolean(
    result.name && 
    result.phone && 
    result.city
  );
  
  console.log("Command validation result:", result.isValid, result.missingFields);
  return result;
}

/**
 * Check if a customer with the given phone number already exists
 */
export function checkDuplicateCustomer(phone: string, customers: any[]): any | null {
  if (!phone) return null;
  return customers.find(customer => customer.phone === phone) || null;
}

/**
 * Create a new customer object from parsed command data
 */
export function createNewCustomer(data: any): any {
  return {
    name: data.name,
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    area: data.city,  // Store ONLY the city in area field, not the product
    source: 'Telegram',
    lead_status: 'New Lead',
    customer_type: 'Prospect'
  };
}
