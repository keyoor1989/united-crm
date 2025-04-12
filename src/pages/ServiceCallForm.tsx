
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Save,
  Loader2,
  Users,
} from "lucide-react";
import { ServiceCall, Customer, Machine, Engineer, EngineerStatus, EngineerSkillLevel } from "@/types/service";
import { mockMachines } from "@/data/mockData";
import { CustomerType } from "@/types/customer";
import CustomerSearch from "@/components/chat/quotation/CustomerSearch";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";

const serviceCallSchema = z.object({
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
});

type ServiceCallFormValues = z.infer<typeof serviceCallSchema>;

const ServiceCallForm = () => {
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
      
      const transformedEngineers: Engineer[] = data.map(eng => ({
        id: eng.id,
        name: eng.name,
        phone: eng.phone,
        email: eng.email,
        location: eng.location,
        status: eng.status as EngineerStatus,
        skillLevel: eng.skill_level as EngineerSkillLevel,
        currentJob: eng.current_job,
        currentLocation: eng.current_location,
        leaveEndDate: eng.leave_end_date || undefined
      }));
      
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

      const initialStatus = data.engineerId ? "Pending" : "New";
      
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
          feedback: null
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Service Call</h1>
        <p className="text-muted-foreground">
          Create a new service call for customer support
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                Select a customer to automatically fill in their details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomerSearch 
                  onSelectCustomer={handleCustomerSelect}
                  showSearch={showCustomerSearch}
                  onToggleSearch={() => setShowCustomerSearch(!showCustomerSearch)}
                  customerName={selectedCustomer?.name || ""}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly={!!selectedCustomer} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly={!!selectedCustomer} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCustomer && (
                  <div className="flex items-center gap-2 p-2 bg-brand-50 rounded-md border border-brand-100">
                    <Clock className="h-5 w-5 text-brand-600" />
                    <span>
                      SLA Response Time:{" "}
                      <strong>{slaTime} hours</strong>
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Machine Details</CardTitle>
              <CardDescription>
                Select machine details for this service call
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="machineId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Machine Model</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleMachineChange(value);
                        }}
                        defaultValue={field.value}
                        disabled={!selectedCustomer || customerMachines.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select machine" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customerMachines.map((machine) => (
                            <SelectItem key={machine.id} value={machine.id}>
                              {machine.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter serial number (optional)" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issue Information</CardTitle>
              <CardDescription>
                Provide details about the service issue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="issueType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Paper Jam">Paper Jam</SelectItem>
                          <SelectItem value="Print Quality">Print Quality</SelectItem>
                          <SelectItem value="Network Issue">Network Issue</SelectItem>
                          <SelectItem value="Scanner Problem">Scanner Problem</SelectItem>
                          <SelectItem value="Error Code">Error Code</SelectItem>
                          <SelectItem value="Software Issue">Software Issue</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="callType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select call type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Warranty">Warranty</SelectItem>
                          <SelectItem value="AMC">AMC</SelectItem>
                          <SelectItem value="Out of Warranty">Out of Warranty</SelectItem>
                          <SelectItem value="Rental">Rental</SelectItem>
                          <SelectItem value="Paid Call">Paid Call</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!!selectedCustomer}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Medium-High">Medium-High</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-2">
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Assign Engineer Now</FormLabel>
                      <FormDescription className="text-xs text-muted-foreground">
                        Toggle to assign an engineer immediately or leave for later
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={assignEngineerNow}
                        onCheckedChange={setAssignEngineerNow}
                      />
                    </FormControl>
                  </FormItem>
                </div>

                {assignEngineerNow && (
                  <FormField
                    control={form.control}
                    name="engineerId"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Assign Engineer</FormLabel>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select engineer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {engineers
                                .filter((engineer) => engineer.status === "Available")
                                .map((engineer) => (
                                  <SelectItem key={engineer.id} value={engineer.id}>
                                    {engineer.name} ({engineer.location})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={autoAssignEngineer}
                            disabled={!selectedCustomer}
                          >
                            Auto-Assign
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="issueDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe the issue in detail..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/service")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Service Call
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default ServiceCallForm;
