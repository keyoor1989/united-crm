
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// The URL of your actual Telegram webhook handler
const WEBHOOK_TARGET_URL = "https://klieshkrqryigtqtshka.supabase.co/functions/v1/telegram-webhook";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Proxy received request");
    
    // Forward the request body to the actual webhook handler
    const requestBody = await req.text();
    console.log("Request body:", requestBody);
    
    // Make the request to the actual webhook handler
    const response = await fetch(WEBHOOK_TARGET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestBody
    });
    
    // Get the response from the actual webhook handler
    const responseBody = await response.text();
    console.log("Response from webhook:", responseBody);
    
    // Return the response from the actual webhook handler
    return new Response(responseBody, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Error in proxy:", error.message);
    
    return new Response(
      JSON.stringify({ error: `Proxy error: ${error.message}` }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
