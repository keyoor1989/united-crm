
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
        serialNumber: machine.machine_serial || "N/A", // Use default for missing data
        installationDate: machine.installation_date || "N/A", // Use default for missing data
        status: "active",
        lastService: machine.last_service || "N/A" // Use default for missing data
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
    console.log("Adding machine with data:", machineData, "for customer:", customerId);
    
    // Only include fields that exist in the customer_machines table
    const data = {
      customer_id: customerId,
      machine_name: machineData.model,
      machine_type: machineData.machineType
    };
    
    console.log("Submitting to Supabase:", data);
    
    const { data: result, error } = await supabase
      .from('customer_machines')
      .insert(data)
      .select();
      
    if (error) {
      console.error("Error adding machine:", error);
      throw error;
    }
    
    console.log("Machine added successfully:", result);
    return result;
  } catch (err) {
    console.error("Unexpected error adding machine:", err);
    throw err;
  }
};
