
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
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setCustomer(data as CustomerType);
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
