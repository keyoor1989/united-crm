
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Machine, Engineer, EngineerStatus, EngineerSkillLevel } from "@/types/service";
import { CustomerType } from "@/types/customer";
import { mockMachines } from "@/data/mockData";

export const serviceCallSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  machineId: z.string().min(1, { message: "Machine is required" }),
  serialNumber: z.string().optional(),
  location: z.string().min(1, { message: "Location is required" }),
  issueType: z.string().min(1, { message: "Issue type is required" }),
  issueDescription: z
    .string()
    .min(10, { message: "Issue description must be at least 10 characters" }),
  callType: z.string().min(1, { message: "Call type is required" }),
  priority: z.string(),
  engineerId: z.string().optional(),
  serviceCharge: z.number().min(0).default(0),
});

export type ServiceCallFormValues = z.infer<typeof serviceCallSchema>;

export const useServiceCallForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [customerMachines, setCustomerMachines] = useState<Machine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slaTime, setSlaTime] = useState<number | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [assignEngineerNow, setAssignEngineerNow] = useState(false);

  const form = useForm<ServiceCallFormValues>({
    resolver: zodResolver(serviceCallSchema),
    defaultValues: {
      customerId: "",
      phone: "",
      machineId: "",
      serialNumber: "",
      location: "",
      issueType: "",
      issueDescription: "",
      callType: "",
      priority: "Medium",
      engineerId: "",
      serviceCharge: 0,
    },
  });

  useEffect(() => {
    setMachines(mockMachines);
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
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
        return;
      }
      
      const transformedEngineers: Engineer[] = data.map(eng => {
        return {
          id: eng.id,
          name: eng.name,
          phone: eng.phone,
          email: eng.email,
          location: eng.location,
          status: eng.status as EngineerStatus,
          skillLevel: eng.skill_level as EngineerSkillLevel,
          currentJob: eng.current_job,
          currentLocation: eng.current_location,
          leaveEndDate: (eng as any).leave_end_date || undefined
        };
      });
      
      setEngineers(transformedEngineers);
    } catch (err) {
      console.error("Unexpected error fetching engineers:", err);
    }
  };

  const handleCustomerSelect = (customer: CustomerType) => {
    setSelectedCustomer(customer);
    setShowCustomerSearch(false);
    
    form.setValue("customerId", customer.id);
    form.setValue("phone", customer.phone);
    form.setValue("location", customer.location);
    
    const priority = determinePriority(customer.status === "Active" ? "corporate" : "individual");
    form.setValue("priority", priority);
    
    fetchCustomerMachines(customer.id);
    
    calculateSLA(customer.status === "Active" ? "corporate" : "individual");
  };

  const fetchCustomerMachines = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_machines')
        .select('*')
        .eq('customer_id', customerId);
        
      if (error) {
        console.error("Error fetching customer machines:", error);
        toast({
          title: "Error",
          description: "Failed to load customer machines",
          variant: "destructive",
        });
        return;
      }
      
      const mappedMachines: Machine[] = data.map(machine => ({
        id: machine.id,
        customerId: machine.customer_id,
        model: machine.machine_name,
        serialNumber: machine.machine_serial || "",
        installDate: machine.installation_date || new Date().toISOString(),
        status: "Active",
        lastService: machine.last_service || "None",
        contractType: "Standard",
      }));
      
      setCustomerMachines(mappedMachines);
      
      if (mappedMachines.length > 0) {
        toast({
          title: "Machines Loaded",
          description: `Found ${mappedMachines.length} machines for this customer`,
        });
      } else {
        toast({
          title: "No Machines",
          description: "No machines found for this customer",
        });
      }
    } catch (err) {
      console.error("Unexpected error fetching machines:", err);
    }
  };

  const handleMachineChange = (machineId: string) => {
    const machine = customerMachines.find((m) => m.id === machineId);
    if (machine) {
      setSelectedMachine(machine);
      form.setValue("serialNumber", machine.serialNumber || "");
    }
  };

  const calculateSLA = (customerType: string) => {
    let hours = 48;
    
    switch (customerType.toLowerCase()) {
      case "government":
        hours = 12;
        break;
      case "corporate":
      case "rental":
        hours = 24;
        break;
      default:
        hours = 48;
    }
    
    setSlaTime(hours);
  };

  const determinePriority = (customerType: string): string => {
    switch (customerType.toLowerCase()) {
      case "government":
        return "High";
      case "corporate":
        return "Medium-High";
      case "rental":
        return "Medium";
      default:
        return "Standard";
    }
  };

  const autoAssignEngineer = () => {
    if (!selectedCustomer) return;
    
    const location = selectedCustomer.location;
    const availableEngineers = engineers.filter(
      (engineer) => engineer.status === "Available"
    );
    
    if (availableEngineers.length > 0) {
      const nearbyEngineer = availableEngineers.find(
        (engineer) => engineer.location === location
      );
      
      if (nearbyEngineer) {
        form.setValue("engineerId", nearbyEngineer.id);
        toast({
          title: "Engineer Auto-Assigned",
          description: `${nearbyEngineer.name} has been assigned to this call`,
        });
      } else {
        form.setValue("engineerId", availableEngineers[0].id);
        toast({
          title: "Engineer Auto-Assigned",
          description: `${availableEngineers[0].name} has been assigned to this call`,
        });
      }
    } else {
      toast({
        title: "No Available Engineers",
        description: "No engineers are currently available for assignment",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: ServiceCallFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (data.serialNumber && data.machineId) {
        const { error: updateError } = await supabase
          .from('customer_machines')
          .update({ machine_serial: data.serialNumber })
          .eq('id', data.machineId);
          
        if (updateError) {
          console.error("Error updating machine serial number:", updateError);
          toast({
            title: "Error",
            description: "Failed to update machine serial number",
            variant: "destructive",
          });
        } else {
          console.log("Machine serial number updated successfully");
        }
      }
      
      const slaHours = slaTime || 48;
      const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();
      
      if (!assignEngineerNow) {
        data.engineerId = null;
      }

      const initialStatus = data.engineerId ? "Pending" : "Pending";
      
      // Determine if it's a paid call and set the appropriate service charge
      const serviceCharge = data.callType === "Paid Call" ? data.serviceCharge : 0;
      const isPaid = data.callType !== "Paid Call";
      
      const { data: serviceCallData, error: serviceCallError } = await supabase
        .from('service_calls')
        .insert({
          customer_id: data.customerId,
          customer_name: selectedCustomer?.name || "",
          phone: data.phone,
          machine_id: data.machineId,
          machine_model: selectedMachine?.model || "",
          serial_number: data.serialNumber || "",
          location: data.location,
          issue_type: data.issueType,
          issue_description: data.issueDescription,
          call_type: data.callType,
          priority: data.priority,
          status: initialStatus,
          engineer_id: data.engineerId || null,
          engineer_name: data.engineerId 
            ? engineers.find(e => e.id === data.engineerId)?.name || ""
            : "",
          sla_deadline: slaDeadline,
          parts_used: [],
          feedback: null,
          service_charge: serviceCharge,
          is_paid: isPaid
        })
        .select()
        .single();
      
      if (serviceCallError) {
        console.error("Error creating service call:", serviceCallError);
        toast({
          title: "Error",
          description: "Failed to create service call in database",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("Service Call Created in Database:", serviceCallData);
      
      if (data.engineerId) {
        const { error: engineerError } = await supabase
          .from('engineers')
          .update({
            status: "On Call",
            current_job: `Service Call #${serviceCallData.id}`,
            current_location: data.location
          })
          .eq('id', data.engineerId);
          
        if (engineerError) {
          console.error("Error updating engineer status:", engineerError);
          toast({
            title: "Warning",
            description: "Service call created but failed to update engineer status",
            variant: "destructive",
          });
        }
      }
      
      toast({
        title: "Service Call Created",
        description: `Service call has been created successfully`,
      });
      
      setIsSubmitting(false);
      navigate("/service");
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: "An error occurred while creating the service call",
        variant: "destructive",
      });
      setIsSubmitting(false);
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
    onSubmit
  };
};
