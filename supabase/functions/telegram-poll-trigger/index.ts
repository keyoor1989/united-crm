
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("Checking if polling is enabled...");
    
    // Check if polling is enabled
    const { data: configData, error: configError } = await supabase
      .from('telegram_config')
      .select('use_polling')
      .single();
    
    if (configError) {
      console.error("Error checking if polling is enabled:", configError);
      return new Response(
        JSON.stringify({ error: 'Failed to check if polling is enabled' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    // If polling is not enabled, don't proceed
    if (!configData?.use_polling) {
      console.log("Polling is not enabled, skipping poll");
      return new Response(
        JSON.stringify({ success: true, message: 'Polling is not enabled' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    console.log("Polling is enabled, triggering poll-updates function");
    
    // Trigger the poll-updates function
    const { data: pollData, error: pollError } = await supabase.functions.invoke("telegram-poll-updates", {
      body: { trigger: "automatic" }
    });
    
    if (pollError) {
      console.error("Error triggering poll-updates function:", pollError);
      return new Response(
        JSON.stringify({ error: 'Failed to trigger poll-updates function' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    console.log("Poll-updates function triggered successfully");
    
    return new Response(
      JSON.stringify({ success: true, message: 'Poll-updates function triggered successfully', data: pollData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error in telegram-poll-trigger:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
