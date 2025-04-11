
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
    const isMobileNumber = prompt.match(/^\s*\d{10}\s*$/);
    
    let effectiveSystemPrompt = systemPrompt || "You are a helpful AI assistant for a copier business management system.";
    
    if (isCustomerProfile) {
      effectiveSystemPrompt = "You are a helpful assistant for a copier business management system. When presented with customer profile data, summarize it concisely in a professional business format. Do not fabricate any information or claim to fetch or access any data. Only summarize the customer information provided to you.";
    } else if (isQuotationRequest) {
      effectiveSystemPrompt = "You are a sales assistant for a copier business. When presented with quotation details, format them professionally as: 'Quotation prepared: [Item Name] for [Customer] @ ₹[price] + GST. Delivery in 7-10 days. Includes standard warranty.' Do not fabricate any information. Only use the quotation information provided to you.";
    } else if (isMobileNumber) {
      effectiveSystemPrompt = "You are a helpful assistant for a copier business management system. If I can find customer data for this mobile number, I will provide it to you, and you should summarize it concisely. If no data is found, simply reply with 'No customer found with this mobile number.'";
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
