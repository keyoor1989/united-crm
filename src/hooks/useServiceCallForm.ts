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
    id: z.string().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
  }),
  machine: z.object({
    model: z.string().optional(),
    serial: z.string().optional(),
  }),
  issueType: z.string().min(1, {
    message: "Please select an issue type.",
  }).optional(),
  issueDetails: z.string().min(10, {
    message: "Issue details must be at least 10 characters.",
  }).optional(),
  callType: z.string().optional(),
  priority: z.string().optional(),
  serviceCharge: z.number().optional().default(0),
  engineerId: z.string().optional(),
  id: z.string().optional(),
});

export type ServiceCallFormData = z.infer<typeof serviceCallFormSchema>;

export const useServiceCallForm = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<any | null>(null);
  const [customerMachines, setCustomerMachines] = useState<any[]>([]);
  const [slaTime, setSlaTime] = useState<number | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(true);
  const [assignEngineerNow, setAssignEngineerNow] = useState(false);
  const [engineers, setEngineers] = useState<any[]>([]);

  const form = useForm<ServiceCallFormData>({
    resolver: zodResolver(serviceCallFormSchema),
    defaultValues: {
      customer: {
        id: "",
        name: "",
        phone: "",
        location: "",
      },
      machine: {
        model: "",
        serial: "",
      },
      issueType: "",
      issueDetails: "",
      callType: "On-Site",
      priority: "Medium",
      serviceCharge: 0,
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
    setShowCustomerSearch(false);
    
    const fetchCustomerMachines = async () => {
      try {
        const { data, error } = await supabase
          .from("customer_machines")
          .select("*")
          .eq("customer_id", customer.id);
        
        if (error) throw error;
        setCustomerMachines(data || []);
      } catch (err) {
        console.error("Error fetching customer machines:", err);
      }
    };

    const fetchEngineers = async () => {
      try {
        const { data, error } = await supabase
          .from("engineers")
          .select("*")
          .eq("status", "Available");
        
        if (error) throw error;
        setEngineers(data || []);
      } catch (err) {
        console.error("Error fetching engineers:", err);
      }
    };

    fetchCustomerMachines();
    fetchEngineers();
    
    setSlaTime(4);
  }, [form]);

  const handleMachineChange = useCallback((machineId: string) => {
    const machine = customerMachines.find(m => m.machine_name === machineId);
    if (machine) {
      form.setValue("machine.model", machine.machine_name);
      form.setValue("machine.serial", machine.machine_serial || "");
      setSelectedMachine(machine);
    }
  }, [customerMachines, form]);

  const autoAssignEngineer = useCallback(() => {
    if (engineers.length > 0) {
      const engineer = engineers[0];
      form.setValue("engineerId", engineer.id);
      toast({
        description: `Auto-assigned to ${engineer.name}`
      });
    } else {
      toast({
        description: "No available engineers found",
        variant: "destructive"
      });
    }
  }, [engineers, form, toast]);

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
        status: "Pending",
        serial_number: formData.machine?.serial || null,
        service_charge: formData.serviceCharge || 0,
        engineer_id: assignEngineerNow ? formData.engineerId : null,
      };

      const { data, error } = await supabase
        .from("service_calls")
        .upsert(serviceCallData)
        .select()
        .single();

      if (error) throw error;

      await notifyServiceCall(serviceCallData);

      toast({
        description: "Service call created successfully"
      });
      
      navigate("/service");
    } catch (error: any) {
      console.error("Error creating service call:", error);
      toast({
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
