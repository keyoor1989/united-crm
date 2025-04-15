
// Helper functions for parsing customer-related commands

/**
 * Parse a message to extract customer information
 */
export function parseCustomerCommand(text: string) {
  const result: any = {
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    product: '',
    isValid: false
  };
  
  // Extract name with more flexible matching
  const nameMatch = text.match(/Name\s+([^,\n]+)/i) || text.match(/Customer\s+([^,\n]+)/i);
  if (nameMatch && nameMatch[1]) {
    result.name = nameMatch[1].trim();
  }
  
  // Enhanced phone number extraction
  const phoneMatch = text.match(/Mobile\s+(\d{10})/i) || text.match(/Phone\s+(\d{10})/i);
  if (phoneMatch && phoneMatch[1]) {
    result.phone = phoneMatch[1].trim();
  }
  
  // Extract email (optional)
  const emailMatch = text.match(/Email\s+([^\s,\n]+@[^\s,\n]+)/i);
  if (emailMatch && emailMatch[1]) {
    result.email = emailMatch[1].trim();
  }
  
  // Improved address extraction - handles multi-word addresses and commas
  // This captures everything between "Address" and either "City", "Email", "Mobile", "Phone", "Interested" or end of line
  const addressRegex = /Address\s+(.*?)(?=\s+City|\s+Email|\s+Mobile|\s+Phone|\s+Interested|$)/is;
  const addressMatch = text.match(addressRegex);
  if (addressMatch && addressMatch[1]) {
    result.address = addressMatch[1].trim();
  }
  
  // For city extraction, we need to make sure we only capture the city name
  // and not any product information that might follow
  const cityRegex = /City\s+(.*?)(?=\s+Email|\s+Mobile|\s+Phone|\s+Interested|$)/is;
  const cityMatch = text.match(cityRegex);
  if (cityMatch && cityMatch[1]) {
    // Only take the city name without any additional text after it
    // First split by newline in case "Interested In" is on the next line
    const cityParts = cityMatch[1].split(/[\n\r]/);
    // Then take just the first part and trim it
    result.city = cityParts[0].trim();
  }
  
  // Extract product interest as a separate field
  const productMatch = text.match(/Interested\s+In\s+([^,\n]+)/i) || 
                      text.match(/Intrested\s+In\s+([^,\n]+)/i) ||  // Common misspelling
                      text.match(/Looking\s+For\s+([^,\n]+)/i) || 
                      text.match(/Needs\s+([^,\n]+)/i);
  if (productMatch && productMatch[1]) {
    result.product = productMatch[1].trim();
  }
  
  // Mandatory field validation
  result.isValid = Boolean(
    result.name && 
    result.phone && 
    result.city
  );
  
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
