
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  model: z.string().min(1, "Model is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientId: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  monthlyRent: z.string().min(1, "Monthly rent is required"),
  copyLimitA4: z.string().optional(),
  copyLimitA3: z.string().optional(),
  extraA4CopyCharge: z.string().optional(),
  extraA3CopyCharge: z.string().optional(),
  department: z.string().optional(),
  initialA4Reading: z.string().optional(),
  initialA3Reading: z.string().optional(),
});

export type RentalMachineFormValues = z.infer<typeof formSchema>;

export const useRentalMachineForm = (onSuccess: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<RentalMachineFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "",
      serialNumber: "",
      clientName: "",
      location: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyRent: "",
      copyLimitA4: "",
      copyLimitA3: "",
      extraA4CopyCharge: "0.5",
      extraA3CopyCharge: "1.0",
      department: "",
      initialA4Reading: "0",
      initialA3Reading: "0",
    },
  });

  const onSubmit = async (values: RentalMachineFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { data: contractData, error: contractError } = await supabase.from('amc_contracts').insert({
        machine_model: values.model,
        serial_number: values.serialNumber,
        customer_name: values.clientName,
        customer_id: values.clientId || null,
        machine_type: 'Copier',
        contract_type: 'Rental',
        start_date: values.startDate,
        end_date: values.endDate,
        monthly_rent: parseFloat(values.monthlyRent),
        copy_limit_a4: values.copyLimitA4 ? parseInt(values.copyLimitA4) : 0,
        copy_limit_a3: values.copyLimitA3 ? parseInt(values.copyLimitA3) : 0,
        extra_a4_copy_charge: values.extraA4CopyCharge ? parseFloat(values.extraA4CopyCharge) : 0,
        extra_a3_copy_charge: values.extraA3CopyCharge ? parseFloat(values.extraA3CopyCharge) : 0,
        department: values.department || null,
        location: values.location,
        status: 'Active',
        billing_cycle: 'Monthly'
      }).select('id').single();

      if (contractError) {
        console.error("Error creating contract:", contractError);
        throw contractError;
      }
      
      if (!contractData || !contractData.id) {
        throw new Error("Failed to create contract, no ID returned");
      }

      const { error: machineError } = await supabase.from('amc_machines').insert({
        model: values.model,
        serial_number: values.serialNumber,
        customer_name: values.clientName,
        customer_id: values.clientId || null,
        location: values.location,
        start_date: values.startDate,
        end_date: values.endDate,
        current_rent: parseFloat(values.monthlyRent),
        copy_limit_a4: values.copyLimitA4 ? parseInt(values.copyLimitA4) : 0,
        copy_limit_a3: values.copyLimitA3 ? parseInt(values.copyLimitA3) : 0,
        department: values.department || null,
        machine_type: 'Copier',
        contract_type: 'Rental',
        contract_id: contractData.id,
        last_a4_reading: values.initialA4Reading ? parseInt(values.initialA4Reading) : 0,
        last_a3_reading: values.initialA3Reading ? parseInt(values.initialA3Reading) : 0,
        last_reading_date: values.startDate
      });

      if (machineError) {
        console.error("Error adding rental machine:", machineError);
        throw machineError;
      }

      toast.success("Rental machine added successfully");
      form.reset();
      onSuccess();
    } catch (err) {
      console.error("Error adding rental machine:", err);
      toast.error("Failed to add rental machine");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    onSubmit,
  };
};
