
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
        serialNumber: machine.machine_serial || "Not Available", // Better user-friendly label
        installationDate: machine.installation_date || "External Purchase", // Indicating external purchase
        status: "active",
        lastService: machine.last_service || "Not Serviced By Us" // Clearer messaging
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
    
    if (!customerId) {
      console.error("Missing customer ID");
      throw new Error("Customer ID is required");
    }
    
    if (!machineData.model) {
      console.error("Missing machine model");
      throw new Error("Machine model is required");
    }
    
    if (!machineData.machineType) {
      console.error("Missing machine type");
      throw new Error("Machine type is required");
    }
    
    // Prepare data for Supabase
    const data = {
      customer_id: customerId,
      machine_name: machineData.model,
      machine_type: machineData.machineType,
      is_external_purchase: true, // Default assumption unless installation data is provided
      machine_serial: machineData.serialNumber || null,
      installation_date: machineData.installationDate || null,
      last_service: null
    };
    
    // If serial number or installation date provided, mark as not external purchase
    if (machineData.serialNumber || machineData.installationDate) {
      data.is_external_purchase = false;
    }
    
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
