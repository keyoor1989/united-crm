
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CustomerType } from "@/types/customer";
import { notifyServiceCall } from "@/services/telegramService";

const serviceCallFormSchema = z.object({
  customer: z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string(),
    location: z.string().optional(),
  }),
  machine: z.object({
    model: z.string(),
    serial: z.string().optional(),
  }),
  issueType: z.string().min(1, {
    message: "Please select an issue type.",
  }),
  issueDetails: z.string().min(10, {
    message: "Issue details must be at least 10 characters.",
  }),
  callType: z.string(),
  priority: z.string(),
  id: z.string().optional(),
});

export type ServiceCallFormData = z.infer<typeof serviceCallFormSchema>;

export const useServiceCallForm = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<any | null>(null);
  const [customerMachines, setCustomerMachines] = useState([]);
  const [slaTime, setSlaTime] = useState<string | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(true);
  const [assignEngineerNow, setAssignEngineerNow] = useState(false);
  const [engineers, setEngineers] = useState([]);

  const form = useForm<ServiceCallFormData>({
    resolver: zodResolver(serviceCallFormSchema),
    defaultValues: {
      customer: {
        id: "",
        name: "",
        phone: "",
      },
      machine: {
        model: "",
        serial: "",
      },
      issueType: "",
      issueDetails: "",
      callType: "On-Site",
      priority: "Medium",
    },
  });

  const handleCustomerSelect = useCallback((customer: CustomerType) => {
    form.setValue("customer", {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      location: customer.location,
    });
    setSelectedCustomer(customer);
    
    // Fetch customer machines and engineers
    // This would be implemented here
  }, [form]);

  const handleMachineChange = useCallback((machineId: string) => {
    // Handle machine selection
    // This would be implemented here
  }, []);

  const autoAssignEngineer = useCallback(() => {
    // Auto assign engineer logic
    // This would be implemented here
  }, []);

  const onSubmit = async (formData: ServiceCallFormData) => {
    setSubmitting(true);
    try {
      const serviceCallData = {
        id: formData.id || uuidv4(),
        customer_id: formData.customer?.id,
        customer_name: formData.customer?.name,
        phone: formData.customer?.phone,
        machine_model: formData.machine?.model,
        issue_type: formData.issueType,
        issue_description: formData.issueDetails,
        call_type: formData.callType,
        priority: formData.priority,
        location: formData.customer?.location,
        status: "Open",
        serial_number: formData.machine?.serial || null,
      };

      const { data, error } = await supabase
        .from("service_calls")
        .upsert(serviceCallData)
        .select()
        .single();

      if (error) throw error;

      // Send notification via Telegram
      await notifyServiceCall(serviceCallData);

      toast({
        title: "Success",
        description: "Service call created successfully"
      });
      
      navigate("/service");
    } catch (error) {
      console.error("Error creating service call:", error);
      toast({
        title: "Error",
        description: "Failed to create service call",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    selectedCustomer,
    selectedMachine,
    customerMachines,
    slaTime,
    showCustomerSearch,
    assignEngineerNow,
    engineers,
    handleCustomerSelect,
    handleMachineChange,
    autoAssignEngineer,
    setShowCustomerSearch,
    setAssignEngineerNow,
    onSubmit,
    setSelectedCustomer
  };
};
