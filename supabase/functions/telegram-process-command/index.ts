import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const { chat_id, command_type, text } = await req.json();
    
    if (!chat_id || !command_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: chat_id and command_type' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    // Log processing of this command
    await supabase.from('telegram_message_logs').insert({
      chat_id,
      message_text: `Processing ${command_type} command: ${text || ''}`,
      message_type: 'command_processing',
      direction: 'internal',
      processed_status: 'processing'
    });
    
    let responseData = { success: true, message: "Command processed successfully" };
    let responseStatus = 200;
    
    try {
      let response = '';
      
      switch (command_type) {
        case 'add_customer':
          response = await processAddCustomer(supabase, text);
          break;
          
        case 'lookup_customer':
          response = await processLookupCustomer(supabase, text);
          break;
          
        case 'report':
          response = await processReport(supabase);
          break;
          
        case 'help':
          response = `
<b>Printer CRM Assistant Help</b>

Here's how to use each feature:

<b>1. Add Customer</b>
Format: Add Customer Name [name] Phone [mobile] Address [address] City [city] Interested In [product]
Example: Add Customer Name Ravi Sharma Phone 8103349299 Address 123 MG Road City Indore Interested In Ricoh 2014D

<b>2. Lookup Customer</b>
Format: Lookup [mobile number]
Example: Lookup 8103349299

<b>3. Create Quotation</b>
Format: Create Quotation Mobile: [number] Model: [model] Price: [price] GST: [rate]
Example: Create Quotation Mobile: 8103349299 Model: Kyocera 2554ci Price: ₹115000 GST: 18%

<b>4. Assign Task</b>
Format: Assign Task Engineer: [name] Customer: [name] Issue: [description] Deadline: [date]
Example: Assign Task Engineer: Mohan Customer: Ravi Sharma Issue: Drum replacement Deadline: Tomorrow

<b>5. Daily Report</b>
Simply type: Daily Report or /report
`;
          break;
          
        default:
          response = "Command type not recognized.";
      }
      
      responseData = { success: true, message: response };
    } catch (error) {
      console.error("Error processing command:", error);
      responseData = { success: false, error: error.message };
      responseStatus = 500;
    }
    
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: responseStatus
      }
    );
  } catch (error) {
    console.error("Error in telegram-process-command:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

async function processAddCustomer(supabase, text) {
  try {
    const customerData = parseCustomerCommand(text);
    
    console.log("Parsed customer data:", customerData);
    console.log("Parsed Name:", customerData.name);
    console.log("Parsed Phone:", customerData.phone);
    console.log("Parsed City:", customerData.city);
    
    if (!customerData.name || !customerData.city || !customerData.phone) {
      return "❌ Missing required information. Please include:\n" +
             "- Name (required)\n" +
             "- Mobile Number (required, 10 digits)\n" +
             "- City (required)\n\n" +
             "Example: Add Customer\n" +
             "Name Ravi Sharma\n" +
             "Mobile 9876543210\n" +
             "Address 477,Omaxe City 2\n" +
             "City Indore\n" +
             "Interested In Ricoh 2014D";
    }
    
    let existingCustomer = null;
    if (customerData.phone) {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', customerData.phone)
        .maybeSingle();
      
      existingCustomer = data;
    }
    
    if (existingCustomer) {
      return `⚠️ Customer with phone ${customerData.phone} already exists.\n\n` +
             `Name: ${existingCustomer.name}\n` +
             `Location: ${existingCustomer.area}\n`;
    }
    
    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: customerData.name,
        phone: customerData.phone || '',
        email: customerData.email || '',
        address: customerData.address || '',
        area: customerData.city,
        source: 'Telegram',
        lead_status: 'New Lead',
        customer_type: 'Prospect'
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding customer:", error);
      return "❌ Failed to add customer. Please try again.";
    }
    
    if (customerData.product && data) {
      await supabase
        .from('customer_machines')
        .insert({
          customer_id: data.id,
          machine_name: customerData.product,
          machine_type: determineProductType(customerData.product),
          is_external_purchase: true
        });
    }
    
    return `✅ Customer <b>${customerData.name}</b> added successfully to CRM!\n\n` +
           `ID: ${data.id}\n` +
           `Mobile: ${customerData.phone}\n` +
           `Address: ${customerData.address || 'Not provided'}\n` +
           `Location: ${customerData.city}\n` +
           (customerData.product ? `Interested in: ${customerData.product}` : '');
    
  } catch (error) {
    console.error("Error in processAddCustomer:", error);
    return "❌ An error occurred while processing your request.";
  }
}

function parseCustomerCommand(text) {
  const result = {
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    product: ''
  };
  
  // First, try to parse the simple multi-line format as seen in the screenshot
  const lines = text.split('\n');
  
  // Check if it starts with "Add Customer" which indicates the format from screenshot
  const isSimpleFormat = text.trim().toLowerCase().startsWith('add customer');
  
  if (isSimpleFormat && lines.length > 1) {
    console.log("Detected simple multi-line format");
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toLowerCase().startsWith('add customer')) {
        // Skip the header line
        continue;
      } else if (trimmedLine.toLowerCase().startsWith('name')) {
        result.name = trimmedLine.substring(4).trim();
      } else if (trimmedLine.toLowerCase().startsWith('mobile')) {
        result.phone = trimmedLine.substring(6).trim().replace(/\D/g, '');
      } else if (trimmedLine.toLowerCase().startsWith('address')) {
        result.address = trimmedLine.substring(7).trim();
      } else if (trimmedLine.toLowerCase().startsWith('city')) {
        result.city = trimmedLine.substring(4).trim();
      } else if (trimmedLine.toLowerCase().startsWith('interested in')) {
        result.product = trimmedLine.substring(13).trim();
      }
    }
    
    console.log("Parsed from simple format:", result);
    
    // If we got the required fields, return early
    if (result.name && result.phone && result.city) {
      // Take just the last 10 digits if phone is longer
      if (result.phone.length > 10) {
        result.phone = result.phone.substring(result.phone.length - 10);
      }
      return result;
    }
  }
  
  // If simple format failed, fall back to regex patterns
  console.log("Simple format parsing failed, trying regex patterns");
  
  // Case-insensitive regex patterns with both colon and space formats
  const nameMatch = text.match(/Name\s*:?\s+([^Phone|^Email|^Address|^City|^Interested|^\n]+)/i);
  if (nameMatch && nameMatch[1]) {
    result.name = nameMatch[1].trim();
  }
  
  const phoneMatch = text.match(/(?:Phone|Mobile)\s*:?\s+([^Name|^Email|^Address|^City|^Interested|^\n]+)/i);
  if (phoneMatch && phoneMatch[1]) {
    result.phone = phoneMatch[1].trim();
    // Extract just the digits if there's formatting
    result.phone = result.phone.replace(/\D/g, '');
    
    // Take the last 10 digits if longer
    if (result.phone.length > 10) {
      result.phone = result.phone.substring(result.phone.length - 10);
    }
  }
  
  const emailMatch = text.match(/Email\s*:?\s+([^Name|^Phone|^Address|^City|^Interested|^\n]+)/i);
  if (emailMatch && emailMatch[1]) {
    result.email = emailMatch[1].trim();
  }
  
  const addressMatch = text.match(/Address\s*:?\s+([^Name|^Phone|^Email|^City|^Interested|^\n]+)/i);
  if (addressMatch && addressMatch[1]) {
    result.address = addressMatch[1].trim();
  }
  
  const cityMatch = text.match(/City\s*:?\s+([^Name|^Phone|^Email|^Address|^Interested|^\n]+)/i);
  if (cityMatch && cityMatch[1]) {
    result.city = cityMatch[1].trim();
  }
  
  const productMatch = text.match(/Interested\s+In\s*:?\s+([^Name|^Phone|^Email|^Address|^City|^\n]+)/i);
  if (productMatch && productMatch[1]) {
    result.product = productMatch[1].trim();
  }
  
  console.log("Parsed from regex patterns:", result);
  return result;
}

function determineProductType(productName) {
  const lowerProduct = productName.toLowerCase();
  if (lowerProduct.includes('kyocera') || lowerProduct.includes('ricoh') || 
      lowerProduct.includes('canon') || lowerProduct.includes('konica')) {
    return 'Copier';
  } else if (lowerProduct.includes('hp') || lowerProduct.includes('epson') || 
            lowerProduct.includes('brother')) {
    return 'Printer';
  } else if (lowerProduct.includes('toner') || lowerProduct.includes('drum') || 
            lowerProduct.includes('cartridge')) {
    return 'Consumable';
  } else {
    return 'Other';
  }
}

async function processLookupCustomer(supabase, text) {
  try {
    const phoneNumber = parsePhoneNumberCommand(text);
    
    if (!phoneNumber) {
      return "❌ Please provide a valid 10-digit phone number.\n\n" +
             "Example: Lookup 8103349299";
    }
    
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*, customer_machines(*)')
      .eq('phone', phoneNumber)
      .maybeSingle();
    
    if (error) {
      console.error("Error looking up customer:", error);
      return "❌ Failed to look up customer. Please try again.";
    }
    
    if (!customer) {
      return `❌ No customer found with number ${phoneNumber}.`;
    }
    
    let machineInfo = "No machines registered";
    if (customer.customer_machines && customer.customer_machines.length > 0) {
      machineInfo = customer.customer_machines.map((machine) => 
        `${machine.machine_name}`
      ).join(", ");
    }
    
    return `📇 <b>Customer Found:</b>\n\n` +
           `<b>Name:</b> ${customer.name}\n` +
           `<b>City:</b> ${customer.area}\n` +
           `<b>Machine:</b> ${machineInfo}\n` +
           `<b>Status:</b> ${customer.lead_status || customer.customer_type || 'Active'}\n` +
           `<b>Last Contact:</b> ${customer.last_contact ? new Date(customer.last_contact).toLocaleDateString() : 'N/A'}`;
    
  } catch (error) {
    console.error("Error in processLookupCustomer:", error);
    return "❌ An error occurred while processing your request.";
  }
}

function parsePhoneNumberCommand(text) {
  // Direct 10-digit number case
  if (/^\d{10}$/.test(text.trim())) {
    return text.trim();
  }
  
  // Lookup command case
  const phoneMatch = text.match(/lookup\s+(\d+)/i);
  if (phoneMatch && phoneMatch[1]) {
    const number = phoneMatch[1].replace(/\D/g, '');
    if (number.length >= 10) {
      return number.substring(number.length - 10);
    }
  }
  
  // Find customer case
  const findCustomerMatch = text.match(/find\s+customer\s+(\d+)/i);
  if (findCustomerMatch && findCustomerMatch[1]) {
    const number = findCustomerMatch[1].replace(/\D/g, '');
    if (number.length >= 10) {
      return number.substring(number.length - 10);
    }
  }
  
  return null;
}

async function processReport(supabase) {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const { data: newCustomers, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);
    
    if (customerError) {
      console.error("Error fetching customers:", customerError);
    }
    
    const { data: quotations, error: quotationError } = await supabase
      .from('quotations')
      .select('*')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);
    
    if (quotationError) {
      console.error("Error fetching quotations:", quotationError);
    }
    
    const { data: completedCalls, error: callsError } = await supabase
      .from('service_calls')
      .select('*')
      .eq('status', 'Completed')
      .gte('completion_time', `${today}T00:00:00`)
      .lte('completion_time', `${today}T23:59:59`);
    
    if (callsError) {
      console.error("Error fetching service calls:", callsError);
    }
    
    let serviceRevenue = 0;
    if (completedCalls) {
      serviceRevenue = completedCalls.reduce((sum, call) => sum + (call.service_charge || 0), 0);
    }
    
    // Prepare report
    let report = `<b>📊 Daily Report: ${now.toLocaleDateString()}</b>\n\n`;
    
    report += `<b>New Customers:</b> ${newCustomers?.length || 0}\n`;
    if (newCustomers && newCustomers.length > 0) {
      report += newCustomers.slice(0, 5).map(c => `- ${c.name} (${c.area})`).join('\n');
      if (newCustomers.length > 5) {
        report += `\n... and ${newCustomers.length - 5} more`;
      }
      report += '\n\n';
    }
    
    report += `<b>Quotations:</b> ${quotations?.length || 0}\n`;
    if (quotations && quotations.length > 0) {
      const totalValue = quotations.reduce((sum, q) => sum + (q.grand_total || 0), 0);
      report += `Total Value: ₹${totalValue.toLocaleString('en-IN')}\n\n`;
    }
    
    report += `<b>Service Calls Completed:</b> ${completedCalls?.length || 0}\n`;
    if (completedCalls && completedCalls.length > 0) {
      report += `Revenue: ₹${serviceRevenue.toLocaleString('en-IN')}\n\n`;
    }
    
    report += `<b>Pending Tasks:</b>\n`;
    const { data: pendingCalls, error: pendingError } = await supabase
      .from('service_calls')
      .select('*')
      .not('status', 'eq', 'Completed')
      .limit(5);
      
    if (!pendingError && pendingCalls) {
      if (pendingCalls.length === 0) {
        report += "No pending tasks! 🎉\n\n";
      } else {
        report += pendingCalls.map(call => 
          `- ${call.customer_name}: ${call.issue_description?.substring(0, 30) || 'Service call'}`
        ).join('\n');
        report += '\n\n';
      }
    }
    
    report += `<i>Generated on ${now.toLocaleString()}</i>`;
    
    return report;
  } catch (error) {
    console.error("Error generating report:", error);
    return "❌ An error occurred while generating the report.";
  }
}
