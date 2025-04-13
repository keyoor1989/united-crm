
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CustomerType } from "@/types/customer";

export const useCustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Fetch customer basic details
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("id", id)
          .single();

        if (customerError) throw customerError;

        // Fetch customer machines
        const { data: machinesData, error: machinesError } = await supabase
          .from("customer_machines")
          .select("machine_name")
          .eq("customer_id", id);

        if (machinesError) throw machinesError;

        // Map the data to our CustomerType
        const mappedCustomer: CustomerType = {
          id: customerData.id,
          name: customerData.name,
          email: customerData.email || "",
          phone: customerData.phone,
          location: customerData.area,
          status: mapLeadStatusToCustomerStatus(customerData.lead_status),
          lastContact: customerData.last_contact ? new Date(customerData.last_contact).toLocaleDateString() : "Never",
          machines: machinesData.map((machine: any) => machine.machine_name),
          machineDetails: [] // Initialize with empty array
        };

        setCustomer(mappedCustomer);
      } catch (err: any) {
        console.error("Error fetching customer details:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [id]);

  return { customer, isLoading, error };
};

// Helper function to map lead_status from database to CustomerStatus type
const mapLeadStatusToCustomerStatus = (leadStatus: string): CustomerType["status"] => {
  switch (leadStatus) {
    case "Converted":
      return "Active";
    case "Lost":
      return "Inactive";
    case "New":
    case "Quoted":
      return "Prospect";
    case "Follow-up":
      return "Contract Renewal";
    default:
      return "Active";
  }
};
