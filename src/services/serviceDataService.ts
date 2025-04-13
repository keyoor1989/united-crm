
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const fetchEngineers = async () => {
  try {
    const { data, error } = await supabase
      .from('engineers')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error fetching engineers:", error);
      toast({
        title: "Error",
        description: "Failed to load engineers",
        variant: "destructive",
      });
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error fetching engineers:", err);
    return { data: null, error: err };
  }
};

export const fetchServiceCalls = async () => {
  try {
    const { data, error } = await supabase
      .from('service_calls')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching service calls:", error);
      toast({
        title: "Error",
        description: "Failed to load service calls",
        variant: "destructive",
      });
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error fetching service calls:", err);
    return { data: null, error: err };
  }
};

export const searchCustomers = async (term: string) => {
  try {
    if (!term || term.length < 2) return { data: [], error: null };
    
    // Search in customers table by name, phone, and location
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, phone, email, area')
      .or(`name.ilike.%${term}%,phone.ilike.%${term}%,area.ilike.%${term}%`)
      .limit(10);
    
    if (error) {
      console.error("Error searching customers:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error searching customers:", err);
    return { data: null, error: err };
  }
};
