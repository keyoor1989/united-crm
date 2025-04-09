import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
} from "lucide-react";
import { ServiceCall, Customer, Machine, Engineer } from "@/types/service";
import { mockCustomers, mockMachines, mockEngineers } from "@/data/mockData";

const serviceCallSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  machineId: z.string().min(1, { message: "Machine is required" }),
  serialNumber: z.string().min(1, { message: "Serial number is required" }),
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [customerMachines, setCustomerMachines] = useState<Machine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slaTime, setSlaTime] = useState<number | null>(null);

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
    setCustomers(mockCustomers);
    setMachines(mockMachines);
    setEngineers(mockEngineers);
  }, []);

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      form.setValue("phone", customer.phone);
      form.setValue("location", customer.location);
      
      const priority = determinePriority(customer.type);
      form.setValue("priority", priority);
      
      const filteredMachines = machines.filter(
        (machine) => machine.customerId === customerId
      );
      setCustomerMachines(filteredMachines);
      
      calculateSLA(customer.type);
    }
  };

  const handleMachineChange = (machineId: string) => {
    const machine = machines.find((m) => m.id === machineId);
    if (machine) {
      setSelectedMachine(machine);
      form.setValue("serialNumber", machine.serialNumber);
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

  const onSubmit = (data: ServiceCallFormValues) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newServiceCall: ServiceCall = {
        id: `SC-${Date.now()}`,
        customerId: data.customerId,
        customerName: selectedCustomer?.name || "",
        phone: data.phone,
        machineId: data.machineId,
        machineModel: selectedMachine?.model || "",
        serialNumber: data.serialNumber,
        location: data.location,
        issueType: data.issueType,
        issueDescription: data.issueDescription,
        callType: data.callType,
        priority: data.priority,
        status: "Pending",
        engineerId: data.engineerId || null,
        engineerName: data.engineerId 
          ? engineers.find(e => e.id === data.engineerId)?.name || ""
          : "",
        createdAt: new Date().toISOString(),
        slaDeadline: new Date(Date.now() + (slaTime || 48) * 60 * 60 * 1000).toISOString(),
        startTime: null,
        completionTime: null,
        partsUsed: [],
        feedback: null,
      };
      
      console.log("New Service Call Created:", newServiceCall);
      
      toast({
        title: "Service Call Created",
        description: `Service call ${newServiceCall.id} has been created successfully`,
      });
      
      setIsSubmitting(false);
      navigate("/service");
    }, 1000);
  };

  return (
    <Layout>
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
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleCustomerChange(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
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
                          disabled={!selectedCustomer}
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
                          <Input {...field} readOnly={!!selectedMachine} />
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

                  <FormField
                    control={form.control}
                    name="engineerId"
                    render={({ field }) => (
                      <FormItem>
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
    </Layout>
  );
};

export default ServiceCallForm;
