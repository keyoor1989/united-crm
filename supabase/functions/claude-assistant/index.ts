
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.3.0/mod.ts";

const claudeApiKey = Deno.env.get('claude');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, systemPrompt } = await req.json();

    if (!claudeApiKey) {
      console.error("Claude API key not found in environment variables");
      return new Response(
        JSON.stringify({ error: "Claude API key not configured" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log("Calling Claude API with prompt:", prompt.substring(0, 50) + "...");

    // Determine the type of content we're dealing with
    const isCustomerProfile = prompt.includes("Customer Profile:") || prompt.includes("Mobile:") || prompt.includes("Last Service:");
    const isQuotationRequest = prompt.includes("Quotation Request:") || prompt.includes("Quote for") || prompt.includes("price for");
    const isMobileNumber = prompt.match(/^\s*\d{10}\s*$/) || prompt.toLowerCase().includes("lookup customer") || prompt.toLowerCase().includes("find customer");
    
    // Default system prompt that makes it clear this is a role-play scenario
    let effectiveSystemPrompt = systemPrompt || `You are a helpful AI assistant for a copier business management system. 
You are pretending to have access to customer data through this system's database.
When presented with customer information in the prompt, summarize and respond as if this data came from the system's database.
You do NOT have access to any real customer database - you're only working with the information provided in each prompt.
Your role is to act as if you're integrated with this copier business ERP system, providing helpful responses based on the data given to you.`;
    
    if (isCustomerProfile) {
      effectiveSystemPrompt = `You are a helpful assistant for a copier business management system. 
When presented with customer profile data, summarize it concisely in a professional business format. 
Format your response as a business summary with sections for:
- Customer details (name, contact, location)
- Equipment (with any service history if provided)
- Recent follow-ups and status

This data was retrieved from the system's database based on a query. 
Respond as if you're integrated with this business system, but remember you're only working with the information provided in this prompt.`;
    } else if (isQuotationRequest) {
      effectiveSystemPrompt = `You are a sales assistant for a copier business. 
When presented with quotation details, format them professionally as: 
'Quotation prepared: [Item Name] for [Customer] @ ₹[price] + GST. Delivery in 7-10 days. Includes standard warranty.' 
Only use the quotation information provided to you.`;
    } else if (isMobileNumber) {
      effectiveSystemPrompt = `You are a helpful assistant for a copier business management system.
The system has found customer data for this query and provided it to you.
Please format this customer information professionally as a business summary.
If no data details are provided in the prompt, simply respond with:
"I've looked up this customer information in our system. The customer information is displayed above."`;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        system: effectiveSystemPrompt,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    console.log("Claude API response received");

    if (data.error) {
      console.error("Claude API error:", data.error);
      return new Response(
        JSON.stringify({ error: data.error }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        content: data.content && data.content[0] ? data.content[0].text : "No response from Claude",
        model: data.model || "claude-3-opus-20240229" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error processing Claude API request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
