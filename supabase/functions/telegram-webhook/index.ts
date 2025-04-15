import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { parseCustomerCommand, checkDuplicateCustomer, createNewCustomer } from './parsers/customer.ts';
import { parsePhoneNumberCommand, findCustomerByPhone } from './parsers/phoneSearch.ts';
import { parseQuotationCommand } from './parsers/quotation.ts';
import { parseTaskCommand } from './parsers/task.ts';
import { generateDailyReport } from './reports/dailyReport.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const telegramBotToken = Deno.env.get('telegram_key') || '';

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const update = await req.json();
    
    const message = update.message || update.edited_message;
    if (!message) {
      return new Response('No message in update', { status: 200 });
    }

    const chat_id = message.chat.id.toString();
    const text = message.text || '';
    
    await supabase.from('telegram_message_logs').insert({
      chat_id,
      message_text: text,
      message_type: text.startsWith('/') ? 'command' : 'message',
      direction: 'incoming',
      processed_status: 'pending'
    });

    const { data: chatData, error: chatError } = await supabase
      .from('telegram_authorized_chats')
      .select('*')
      .eq('chat_id', chat_id)
      .eq('is_active', true)
      .single();

    if (chatError || !chatData) {
      await supabase.from('telegram_message_logs')
        .update({ processed_status: 'unauthorized' })
        .eq('chat_id', chat_id)
        .eq('message_text', text)
        .eq('direction', 'incoming');
        
      await sendTelegramMessage(chat_id, "You are not authorized to use this bot. Please contact the administrator.");
      return new Response('Unauthorized chat', { status: 200 });
    }

    if (text.startsWith('/')) {
      await handleCommands(chat_id, text);
    } 
    else if (text.toLowerCase().startsWith('add customer') || 
             text.toLowerCase().startsWith('new customer')) {
      await handleAddCustomer(chat_id, text);
    }
    else if (text.toLowerCase().startsWith('delete customer') || 
             text.toLowerCase().startsWith('remove customer')) {
      await handleDeleteCustomer(chat_id, text);
    }
    else if (text.toLowerCase().startsWith('lookup') || 
             text.match(/^\d{10}$/) || 
             text.toLowerCase().includes('find customer')) {
      await handleCustomerLookup(chat_id, text);
    }
    else if (text.toLowerCase().startsWith('create quotation') ||
             text.toLowerCase().startsWith('new quotation') ||
             text.toLowerCase().startsWith('quotation for')) {
      await handleCreateQuotation(chat_id, text);
    }
    else if (text.toLowerCase().startsWith('assign task') ||
             text.toLowerCase().startsWith('new task')) {
      await handleAssignTask(chat_id, text);
    }
    else if (text.toLowerCase() === 'daily report' || 
             text.toLowerCase() === 'report' ||
             text.toLowerCase() === 'today\'s report') {
      await handleDailyReport(chat_id);
    }
    else {
      await sendTelegramMessage(chat_id, 
        "I didn't understand that command. Here's what I can help you with:\n\n" +
        "• Add Customer [details]\n" +
        "• Delete Customer [name or phone]\n" +
        "• Lookup [mobile number]\n" +
        "• Create Quotation [details]\n" +
        "• Assign Task [details]\n" +
        "• Daily Report\n\n" +
        "Type /help for more information."
      );
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});

async function sendTelegramMessage(chat_id: string, text: string, parse_mode: string = 'HTML') {
  try {
    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id,
        text,
        parse_mode,
      }),
    });

    const responseData = await response.json();
    
    await supabase.from('telegram_message_logs').insert({
      chat_id,
      message_text: text,
      message_type: 'response',
      direction: 'outgoing',
      processed_status: responseData.ok ? 'sent' : 'failed',
    });

    return responseData;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

async function handleCommands(chat_id: string, text: string) {
  const command = text.split(' ')[0].substring(1).toLowerCase();
  
  switch (command) {
    case 'start':
      await sendTelegramMessage(chat_id, `
Welcome to the Printer CRM Assistant! 👋

I can help you with:
• Adding new customers
• Looking up customer information
• Creating quotations
• Assigning tasks to engineers
• Getting daily reports

Type /help to see more details on how to use these features.
      `);
      break;
      
    case 'help':
      await sendTelegramMessage(chat_id, `
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
Simply type: Daily Report
      `, 'HTML');
      break;
      
    default:
      await sendTelegramMessage(chat_id, "Unknown command. Type /help for available commands.");
      break;
  }
}

async function handleAddCustomer(chat_id: string, text: string) {
  try {
    const customerData = parseCustomerCommand(text);
    
    if (!customerData.name || !customerData.city || !customerData.phone) {
      await sendTelegramMessage(chat_id, 
        "❌ Missing required information. Please include:\n" +
        "- Name (required)\n" +
        "- Mobile Number (required, 10 digits)\n" +
        "- City (required)\n\n" +
        "Example: Add Customer\n" +
        "Name Ravi Sharma\n" +
        "Mobile 9876543210\n" +
        "Address 477,Omaxe City 2\n" +
        "City Indore\n" +
        "Interested In Ricoh 2014D"
      );
      return;
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
      await sendTelegramMessage(chat_id, 
        `⚠️ Customer with phone ${customerData.phone} already exists.\n\n` +
        `Name: ${existingCustomer.name}\n` +
        `Location: ${existingCustomer.area}\n`
      );
      return;
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
      await sendTelegramMessage(chat_id, "❌ Failed to add customer. Please try again.");
      return;
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
    
    await sendTelegramMessage(chat_id, 
      `✅ Customer <b>${customerData.name}</b> added successfully to CRM!\n\n` +
      `ID: ${data.id}\n` +
      `Mobile: ${customerData.phone}\n` +
      `Address: ${customerData.address || 'Not provided'}\n` +
      `Location: ${customerData.city}\n` +
      (customerData.product ? `Interested in: ${customerData.product}` : ''),
      'HTML'
    );
    
  } catch (error) {
    console.error("Error in handleAddCustomer:", error);
    await sendTelegramMessage(chat_id, "❌ An error occurred while processing your request.");
  }
}

function determineProductType(productName: string): string {
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

async function handleCustomerLookup(chat_id: string, text: string) {
  try {
    const phoneNumber = parsePhoneNumberCommand(text);
    
    if (!phoneNumber) {
      await sendTelegramMessage(chat_id, 
        "❌ Please provide a valid 10-digit phone number.\n\n" +
        "Example: Lookup 8103349299"
      );
      return;
    }
    
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*, customer_machines(*)')
      .eq('phone', phoneNumber)
      .maybeSingle();
    
    if (error) {
      console.error("Error looking up customer:", error);
      await sendTelegramMessage(chat_id, "❌ Failed to look up customer. Please try again.");
      return;
    }
    
    if (!customer) {
      await sendTelegramMessage(chat_id, `❌ No customer found with number ${phoneNumber}.`);
      return;
    }
    
    let machineInfo = "No machines registered";
    if (customer.customer_machines && customer.customer_machines.length > 0) {
      machineInfo = customer.customer_machines.map((machine: any) => 
        `${machine.machine_name}`
      ).join(", ");
    }
    
    await sendTelegramMessage(chat_id, 
      `📇 <b>Customer Found:</b>\n\n` +
      `<b>Name:</b> ${customer.name}\n` +
      `<b>City:</b> ${customer.area}\n` +
      `<b>Machine:</b> ${machineInfo}\n` +
      `<b>Status:</b> ${customer.lead_status || customer.customer_type || 'Active'}\n` +
      `<b>Last Contact:</b> ${customer.last_contact ? new Date(customer.last_contact).toLocaleDateString() : 'N/A'}`,
      'HTML'
    );
    
  } catch (error) {
    console.error("Error in handleCustomerLookup:", error);
    await sendTelegramMessage(chat_id, "❌ An error occurred while processing your request.");
  }
}

async function handleCreateQuotation(chat_id: string, text: string) {
  try {
    const quotationData = parseQuotationCommand(text);
    
    if (!quotationData.mobile || !quotationData.model) {
      await sendTelegramMessage(chat_id, 
        "❌ Missing required information. Please include at least Mobile and Model.\n\n" +
        "Example: Create Quotation Mobile: 8103349299 Model: Kyocera 2554ci Price: ₹115000"
      );
      return;
    }
    
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', quotationData.mobile)
      .maybeSingle();
    
    if (customerError || !customer) {
      await sendTelegramMessage(chat_id, 
        `❌ No customer found with mobile number ${quotationData.mobile}.\n\n` +
        "Please add the customer first or check the number."
      );
      return;
    }
    
    const price = parseFloat(quotationData.price || "0");
    const gstRate = parseFloat(quotationData.gst || "18");
    const gstAmount = (price * gstRate) / 100;
    const totalPrice = price + gstAmount;
    
    const formattedPrice = formatCurrency(price);
    const formattedTotal = formatCurrency(totalPrice);
    
    const quotationItem = {
      id: crypto.randomUUID(),
      name: quotationData.model,
      description: `${quotationData.model} with standard accessories`,
      quantity: 1,
      unitPrice: price,
      gstPercent: gstRate,
      gstAmount: gstAmount,
      total: totalPrice
    };
    
    const quotationNumber = `Q${Date.now().toString().substring(7)}`;
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .insert({
        quotation_number: quotationNumber,
        customer_id: customer.id,
        customer_name: customer.name,
        items: [quotationItem],
        subtotal: price,
        total_gst: gstAmount,
        grand_total: totalPrice,
        status: 'Draft',
        notes: `Created via Telegram by ${chat_id}`,
        terms: "Payment terms: 50% advance, balance on delivery\nDelivery within 7 days of order confirmation",
      })
      .select()
      .single();
    
    if (quotationError) {
      console.error("Error creating quotation:", quotationError);
      await sendTelegramMessage(chat_id, "❌ Failed to create quotation. Please try again.");
      return;
    }
    
    await sendTelegramMessage(chat_id, 
      `🧾 <b>Quotation Summary</b> (#${quotationNumber})\n\n` +
      `<b>${quotationData.model}</b> for ${customer.name}\n\n` +
      `Price: ₹${formattedPrice} + GST (₹${formattedTotal})\n` +
      `Delivery: ${quotationData.delivery || '7 days'} | Warranty: ${quotationData.warranty || '1 year onsite'}\n\n` +
      `<i>Quotation saved in CRM. ID: ${quotation.id}</i>`,
      'HTML'
    );
    
  } catch (error) {
    console.error("Error in handleCreateQuotation:", error);
    await sendTelegramMessage(chat_id, "❌ An error occurred while processing your request.");
  }
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-IN');
}

async function handleAssignTask(chat_id: string, text: string) {
  try {
    const taskData = parseTaskInfo(text);
    
    if (!taskData.engineer || !taskData.customer) {
      await sendTelegramMessage(chat_id, 
        "❌ Missing required information. Please include both Engineer and Customer.\n\n" +
        "Example: Assign Task Engineer: Mohan Customer: Ravi Sharma Issue: Toner replacement"
      );
      return;
    }
    
    const { data: engineer, error: engineerError } = await supabase
      .from('engineers')
      .select('*')
      .ilike('name', `%${taskData.engineer}%`)
      .maybeSingle();
    
    if (engineerError || !engineer) {
      await sendTelegramMessage(chat_id, 
        `❌ Engineer "${taskData.engineer}" not found in system.\n\n` +
        "Please check the name and try again."
      );
      return;
    }
    
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .ilike('name', `%${taskData.customer}%`)
      .maybeSingle();
    
    if (customerError || !customer) {
      await sendTelegramMessage(chat_id, 
        `❌ Customer "${taskData.customer}" not found in system.\n\n` +
        "Please check the name and try again."
      );
      return;
    }
    
    let deadlineDate = new Date();
    if (taskData.deadline) {
      if (taskData.deadline.toLowerCase() === 'tomorrow') {
        deadlineDate.setDate(deadlineDate.getDate() + 1);
      } else if (taskData.deadline.toLowerCase().includes('next')) {
        deadlineDate.setDate(deadlineDate.getDate() + 7);
      } else {
        try {
          const parsedDate = new Date(taskData.deadline);
          if (!isNaN(parsedDate.getTime())) {
            deadlineDate = parsedDate;
          }
        } catch (e) {
        }
      }
    }
    
    const { data: serviceCall, error: serviceError } = await supabase
      .from('service_calls')
      .insert({
        customer_id: customer.id,
        customer_name: customer.name,
        phone: customer.phone,
        engineer_id: engineer.id,
        engineer_name: engineer.name,
        location: customer.area,
        status: 'Assigned',
        priority: taskData.priority || 'Medium',
        call_type: 'Regular Service',
        issue_description: taskData.issue || 'General maintenance',
        issue_type: determineIssueType(taskData.issue || ''),
        sla_deadline: deadlineDate.toISOString()
      })
      .select()
      .single();
    
    if (serviceError) {
      console.error("Error creating service call:", serviceError);
      await sendTelegramMessage(chat_id, "❌ Failed to assign task. Please try again.");
      return;
    }
    
    await supabase
      .from('engineers')
      .update({ current_job: `Service for ${customer.name}` })
      .eq('id', engineer.id);
    
    await sendTelegramMessage(chat_id, 
      `✅ Task assigned to <b>${engineer.name}</b> for customer <b>${customer.name}</b>\n\n` +
      `<b>Issue:</b> ${taskData.issue || 'General maintenance'}\n` +
      `<b>Deadline:</b> ${deadlineDate.toLocaleDateString()}\n` +
      `<b>Service ID:</b> ${serviceCall.id}`,
      'HTML'
    );
    
  } catch (error) {
    console.error("Error in handleAssignTask:", error);
    await sendTelegramMessage(chat_id, "❌ An error occurred while processing your request.");
  }
}

function parseTaskInfo(text: string) {
  const result: any = {
    engineer: '',
    customer: '',
    issue: '',
    deadline: '',
    priority: ''
  };
  
  const engineerMatch = text.match(/Engineer:?\s+([^,\n]+)/i);
  if (engineerMatch && engineerMatch[1]) {
    result.engineer = engineerMatch[1].trim();
  }
  
  const customerMatch = text.match(/Customer:?\s+([^,\n]+)/i);
  if (customerMatch && customerMatch[1]) {
    result.customer = customerMatch[1].trim();
  }
  
  const issueMatch = text.match(/Issue:?\s+([^,\n]+)/i);
  if (issueMatch && issueMatch[1]) {
    result.issue = issueMatch[1].trim();
  }
  
  const deadlineMatch = text.match(/Deadline:?\s+([^,\n]+)/i);
  if (deadlineMatch && deadlineMatch[1]) {
    result.deadline = deadlineMatch[1].trim();
  }
  
  const priorityMatch = text.match(/Priority:?\s+([^,\n]+)/i);
  if (priorityMatch && priorityMatch[1]) {
    result.priority = priorityMatch[1].trim();
  }
  
  return result;
}

function determineIssueType(issueDescription: string): string {
  const lowerIssue = issueDescription.toLowerCase();
  
  if (lowerIssue.includes('toner') || lowerIssue.includes('cartridge') || 
      lowerIssue.includes('ink')) {
    return 'Supplies';
  } else if (lowerIssue.includes('paper') || lowerIssue.includes('jam') || 
             lowerIssue.includes('feed')) {
    return 'Paper Feed';
  } else if (lowerIssue.includes('quality') || lowerIssue.includes('print') || 
             lowerIssue.includes('image')) {
    return 'Print Quality';
  } else if (lowerIssue.includes('network') || lowerIssue.includes('connect') || 
             lowerIssue.includes('wifi')) {
    return 'Connectivity';
  } else if (lowerIssue.includes('error') || lowerIssue.includes('code') || 
             lowerIssue.includes('message')) {
    return 'Error Code';
  } else if (lowerIssue.includes('drum') || lowerIssue.includes('fuser') || 
             lowerIssue.includes('maintenance')) {
    return 'Component Replacement';
  } else {
    return 'General';
  }
}

async function handleDailyReport(chat_id: string) {
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
    
    const report = generateDailyReport({
      newCustomers: newCustomers || [],
      quotations: quotations || [],
      completedCalls: completedCalls || [],
      serviceRevenue,
      date: now.toLocaleDateString()
    });
    
    await sendTelegramMessage(chat_id, report, 'HTML');
    
  } catch (error) {
    console.error("Error in handleDailyReport:", error);
    await sendTelegramMessage(chat_id, "❌ An error occurred while generating the report.");
  }
}

async function handleDeleteCustomer(chat_id: string, text: string) {
  try {
    let customerIdentifier = '';
    
    const nameMatch = text.match(/customer\s+([^,\n]+)/i);
    if (nameMatch && nameMatch[1]) {
      customerIdentifier = nameMatch[1].trim();
    }
    
    if (!customerIdentifier) {
      await sendTelegramMessage(chat_id, 
        "❌ Please specify customer name or phone number.\n\n" +
        "Example: Delete Customer Anil Yadav\n" +
        "or: Delete Customer Phone 9876543210"
      );
      return;
    }
    
    const isPhoneNumber = /^\d{10}$/.test(customerIdentifier);
    
    let customerQuery = supabase.from('customers').select('*, customer_machines(*)');
    
    if (isPhoneNumber) {
      customerQuery = customerQuery.eq('phone', customerIdentifier);
    } else {
      customerQuery = customerQuery.ilike('name', `%${customerIdentifier}%`);
    }
    
    const { data: customers, error: customerError } = await customerQuery;
    
    if (customerError) {
      console.error("Error looking up customer:", customerError);
      await sendTelegramMessage(chat_id, "❌ Failed to look up customer. Please try again.");
      return;
    }
    
    if (!customers || customers.length === 0) {
      await sendTelegramMessage(chat_id, `❌ No customer found with ${isPhoneNumber ? 'phone number' : 'name'} "${customerIdentifier}".`);
      return;
    }
    
    if (customers.length > 1) {
      const customerList = customers.map((c, i) => `${i+1}. ${c.name} (${c.phone})`).join('\n');
      await sendTelegramMessage(chat_id, 
        `⚠️ Multiple customers found. Please be more specific:\n\n${customerList}\n\n` +
        `Try using a phone number for exact matching.`
      );
      return;
    }
    
    const customer = customers[0];
    
    let hasMachines = customer.customer_machines && customer.customer_machines.length > 0;
    
    if (hasMachines) {
      const { error: machineError } = await supabase
        .from('customer_machines')
        .delete()
        .eq('customer_id', customer.id);
      
      if (machineError) {
        console.error("Error deleting customer machines:", machineError);
        await sendTelegramMessage(chat_id, 
          `❌ Failed to delete customer's machines. Please try again or contact administrator.`
        );
        return;
      }
    }
    
    const { data: serviceCalls } = await supabase
      .from('service_calls')
      .select('id')
      .eq('customer_id', customer.id);
      
    if (serviceCalls && serviceCalls.length > 0) {
      const { error: serviceCallsError } = await supabase
        .from('service_calls')
        .delete()
        .eq('customer_id', customer.id);
        
      if (serviceCallsError) {
        console.error("Error deleting service calls:", serviceCallsError);
        await sendTelegramMessage(chat_id, 
          `❌ Failed to delete customer's service calls. Please try again or contact administrator.`
        );
        return;
      }
    }
    
    const { error: notesError } = await supabase
      .from('customer_notes')
      .delete()
      .eq('customer_id', customer.id);
      
    if (notesError) {
      console.error("Error deleting customer notes:", notesError);
      // Not critical, so continue
    }
    
    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', customer.id);
    
    if (deleteError) {
      console.error("Error deleting customer:", deleteError);
      await sendTelegramMessage(chat_id, 
        `❌ Failed to delete customer. Error: ${deleteError.message}`
      );
      return;
    }
    
    await sendTelegramMessage(chat_id, 
      `✅ Customer <b>${customer.name}</b> successfully deleted.\n\n` +
      `${hasMachines ? `${customer.customer_machines.length} associated machines were also deleted.` : ''}` +
      `${serviceCalls && serviceCalls.length > 0 ? `\n${serviceCalls.length} service calls were deleted.` : ''}`,
      'HTML'
    );
    
  } catch (error) {
    console.error("Error in handleDeleteCustomer:", error);
    await sendTelegramMessage(chat_id, "❌ An error occurred while processing your request.");
  }
}
