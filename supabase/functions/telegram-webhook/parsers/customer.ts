
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
  
  // Extract name
  const nameMatch = text.match(/Name\s+([^,\n]+)/i) || text.match(/Customer\s+([^,\n]+)/i);
  if (nameMatch && nameMatch[1]) {
    result.name = nameMatch[1].trim();
  }
  
  // Extract phone
  const phoneMatch = text.match(/Phone\s+(\d{10})/i) || text.match(/Mobile\s+(\d{10})/i);
  if (phoneMatch && phoneMatch[1]) {
    result.phone = phoneMatch[1].trim();
  }
  
  // Extract email
  const emailMatch = text.match(/Email\s+([^\s,\n]+@[^\s,\n]+)/i);
  if (emailMatch && emailMatch[1]) {
    result.email = emailMatch[1].trim();
  }
  
  // Extract address
  const addressMatch = text.match(/Address\s+([^,\n]+)/i);
  if (addressMatch && addressMatch[1]) {
    result.address = addressMatch[1].trim();
  }
  
  // Extract city
  const cityMatch = text.match(/City\s+([^,\n]+)/i) || text.match(/Location\s+([^,\n]+)/i);
  if (cityMatch && cityMatch[1]) {
    result.city = cityMatch[1].trim();
  }
  
  // Extract product interest
  const productMatch = text.match(/Interested\s+In\s+([^,\n]+)/i) || 
                      text.match(/Looking\s+For\s+([^,\n]+)/i) || 
                      text.match(/Needs\s+([^,\n]+)/i);
  if (productMatch && productMatch[1]) {
    result.product = productMatch[1].trim();
  }
  
  // Check if mandatory fields are present
  result.isValid = Boolean(result.name && result.city && result.phone);
  
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
    area: data.city,
    source: 'Telegram',
    lead_status: 'New Lead',
    customer_type: 'Prospect'
  };
}
