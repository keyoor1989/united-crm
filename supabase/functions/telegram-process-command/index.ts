
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const telegramBotToken = Deno.env.get('telegram_key') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const telegramApi = `https://api.telegram.org/bot${telegramBotToken}`;
    
    // Parse request body
    const { chat_id, text, command_type } = await req.json();
    
    if (!chat_id || !text || !command_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    // Log processing of this command
    await supabase.from('telegram_message_logs').insert({
      chat_id,
      message_text: `Processing ${command_type} command: ${text}`,
      message_type: 'command_processing',
      direction: 'internal',
      processed_status: 'processing'
    });
    
    let response = '';
    
    switch (command_type) {
      case 'add_customer':
        response = await processAddCustomer(supabase, text);
        break;
        
      case 'lookup_customer':
        response = await processLookupCustomer(supabase, text);
        break;
        
      default:
        response = "Command type not recognized.";
    }
    
    // Send the response
    const sendResponse = await fetch(`${telegramApi}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id,
        text: response,
        parse_mode: "HTML"
      }),
    });
    
    const responseData = await sendResponse.json();
    
    // Log the outgoing message
    await supabase.from('telegram_message_logs').insert({
      chat_id,
      message_text: response.substring(0, 500),
      message_type: 'command_response',
      direction: 'outgoing',
      processed_status: responseData.ok ? 'sent' : 'failed'
    });
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
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
  
  const nameMatch = text.match(/Name\s+([^Phone|^Email|^Address|^City|^Interested|^\n]+)/i);
  if (nameMatch && nameMatch[1]) {
    result.name = nameMatch[1].trim();
  }
  
  const phoneMatch = text.match(/Phone\s+([^Name|^Email|^Address|^City|^Interested|^\n]+)/i);
  if (phoneMatch && phoneMatch[1]) {
    result.phone = phoneMatch[1].trim();
    // Extract just the digits if there's formatting
    result.phone = result.phone.replace(/\D/g, '');
    
    // Take the last 10 digits if longer
    if (result.phone.length > 10) {
      result.phone = result.phone.substring(result.phone.length - 10);
    }
  }
  
  const emailMatch = text.match(/Email\s+([^Name|^Phone|^Address|^City|^Interested|^\n]+)/i);
  if (emailMatch && emailMatch[1]) {
    result.email = emailMatch[1].trim();
  }
  
  const addressMatch = text.match(/Address\s+([^Name|^Phone|^Email|^City|^Interested|^\n]+)/i);
  if (addressMatch && addressMatch[1]) {
    result.address = addressMatch[1].trim();
  }
  
  const cityMatch = text.match(/City\s+([^Name|^Phone|^Email|^Address|^Interested|^\n]+)/i);
  if (cityMatch && cityMatch[1]) {
    result.city = cityMatch[1].trim();
  }
  
  const productMatch = text.match(/Interested\s+In\s+([^Name|^Phone|^Email|^Address|^City|^\n]+)/i);
  if (productMatch && productMatch[1]) {
    result.product = productMatch[1].trim();
  }
  
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
