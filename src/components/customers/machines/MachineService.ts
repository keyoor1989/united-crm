
import { supabase } from "@/integrations/supabase/client";
import { Machine, MachineFormData } from "./types";

export const fetchCustomerMachines = async (customerId: string): Promise<Machine[]> => {
  try {
    const { data, error } = await supabase
      .from('customer_machines')
      .select('*')
      .eq('customer_id', customerId);
      
    if (error) {
      console.error("Error fetching machines:", error);
      throw error;
    }
    
    if (data && data.length > 0) {
      return data.map((machine) => ({
        id: machine.id,
        model: machine.machine_name,
        serialNumber: "N/A", // Default for customers who don't have machines sold by us
        installationDate: "N/A", // Default for customers who don't have machines sold by us
        status: "active",
        lastService: "N/A" // Default value
      }));
    }
    
    return [];
  } catch (err) {
    console.error("Unexpected error fetching machines:", err);
    throw err;
  }
};

export const addMachine = async (customerId: string, machineData: MachineFormData) => {
  try {
    // Only include fields that exist in the customer_machines table
    const data = {
      customer_id: customerId,
      machine_name: machineData.model,
      machine_type: machineData.machineType
    };
    
    const { data: result, error } = await supabase
      .from('customer_machines')
      .insert(data)
      .select();
      
    if (error) {
      console.error("Error adding machine:", error);
      throw error;
    }
    
    return result;
  } catch (err) {
    console.error("Unexpected error adding machine:", err);
    throw err;
  }
};
