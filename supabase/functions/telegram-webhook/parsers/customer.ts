
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
    const nameMatch = text.match(pattern);
    if (nameMatch && nameMatch[1]) {
      result.name = nameMatch[1].trim();
      console.log("Extracted name:", result.name);
      break;
    }
  }
  
  // If name not found with patterns, try to find first segment that could be a name
  if (!result.name) {
    // Try to extract the name after "add customer" or similar phrases
    const addCustomerMatch = text.match(/(?:add|new)\s+customer\s+([^,\d]+)/i);
    if (addCustomerMatch && addCustomerMatch[1]) {
      result.name = addCustomerMatch[1].trim();
      console.log("Extracted name from add customer phrase:", result.name);
    } else {
      // Try to extract the first segment that looks like a name
      const words = text.split(/[\s,]+/);
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
    const phoneMatch = text.match(pattern);
    if (phoneMatch && phoneMatch[1]) {
      result.phone = phoneMatch[1].replace(/\D/g, '');
      console.log("Extracted phone:", result.phone);
      break;
    }
  }
  
  // If no phone found, try to find any 10-digit number in the text
  if (!result.phone) {
    const digitsOnly = text.replace(/\D/g, ' ');
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
  
  // Enhanced city extraction with multiple patterns
  const cityPatterns = [
    /City\s+(.*?)(?=\s+Email|\s+Mobile|\s+Phone|\s+Interested|$)/is,
    /(?:from|in|at)\s+([A-Za-z]+)(?=[,\s]|$)/i,
    /([A-Za-z]+)\s+(?:city|area)/i,
    /Area\s+([^,\n]+)/i,
    /(?:location|city|address)[:\s]+([A-Za-z]+)(?=[,\s]|$)/i
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
  
  // If city not found, check for common Indian city names
  if (!result.city) {
    const commonCities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
      'Pune', 'Jaipur', 'Lucknow', 'Ahmedabad', 'Bhopal', 'Indore',
      'Chandigarh', 'Nagpur', 'Patna', 'Surat', 'Vadodara', 'Kochi'
    ];
    
    for (const city of commonCities) {
      if (text.includes(city) || text.includes(city.toLowerCase())) {
        result.city = city;
        console.log("Extracted city from common cities list:", result.city);
        break;
      }
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
  
  // Mandatory field validation
  result.isValid = Boolean(
    result.name && 
    result.phone && 
    result.city
  );
  
  console.log("Command validation result:", result.isValid, "Missing fields:", result.missingFields);
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
