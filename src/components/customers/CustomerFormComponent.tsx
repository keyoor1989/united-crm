
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, User, Map, Printer, MessageSquare, Mail, Calendar, Building, Check, Loader2 } from "lucide-react";
import CustomerNotes from "./CustomerNotes";
import CustomerMachines from "./CustomerMachines";
import CustomerHistory from "./CustomerHistory";
import { useNavigate } from "react-router-dom";
import { CustomerType, CustomerStatus } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  email: z.string().email({ message: "Please enter a valid email" }).optional().or(z.literal("")),
  address: z.string().min(5, { message: "Please enter a complete address" }),
  area: z.string().min(1, { message: "Please enter customer area" }),
  customerType: z.enum(["individual", "government", "corporate"], { 
    required_error: "Please select the customer type" 
  }),
  dateOfBirth: z.string().optional(),
  machineInterest: z.string().optional(),
  machineType: z.string().min(1, { message: "Please select a machine type" }).optional(),
  source: z.string().min(1, { message: "Please select a source" }),
  notes: z.string().optional(),
  leadStatus: z.enum(["New", "Quoted", "Follow-up", "Converted", "Lost"]),
  isNewCustomer: z.boolean().default(true),
});

type CustomerFormValues = z.infer<typeof formSchema>;

const defaultValues: Partial<CustomerFormValues> = {
  name: "",
  phone: "",
  email: "",
  address: "",
  area: "",
  customerType: "individual",
  machineType: "",
  source: "",
  notes: "",
  leadStatus: "New",
  isNewCustomer: true,
};

export default function CustomerFormComponent() {
  const [isNewCustomer, setIsNewCustomer] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(data: CustomerFormValues) {
    setIsSubmitting(true);
    
    try {
      console.log("Submitting form data:", data);
      
      // Create the customer object
      const customerData = {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        area: data.area,
        customer_type: data.customerType,
        date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null,
        lead_status: data.leadStatus,
        last_contact: new Date().toISOString()
      };
      
      console.log("Customer data to insert:", customerData);
      
      // Save customer to Supabase
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert([customerData])
        .select('id')
        .single();
      
      if (customerError) {
        console.error("Error saving customer:", customerError);
        toast.error("Failed to save customer: " + customerError.message);
        return;
      }
      
      if (!newCustomer) {
        console.error("No customer ID returned after insert");
        toast.error("Failed to save customer: No ID returned");
        return;
      }
      
      console.log("Customer saved successfully with ID:", newCustomer.id);
      
      // If machine interest is provided, save it to customer_machines table
      if (data.machineInterest && newCustomer.id) {
        const machineData = {
          customer_id: newCustomer.id,
          machine_name: data.machineInterest,
          machine_type: data.machineType || null
        };
        
        console.log("Machine data to insert:", machineData);
        
        const { error: machineError } = await supabase
          .from('customer_machines')
          .insert([machineData]);
        
        if (machineError) {
          console.error("Error saving machine interest:", machineError);
          // Continue as this is not critical
        }
      }
      
      // If notes are provided, save them to customer_notes table
      if (data.notes && newCustomer.id) {
        const noteData = {
          customer_id: newCustomer.id,
          content: data.notes,
          created_by: "System"
        };
        
        console.log("Note data to insert:", noteData);
        
        const { error: notesError } = await supabase
          .from('customer_notes')
          .insert([noteData]);
        
        if (notesError) {
          console.error("Error saving customer notes:", notesError);
          // Continue as this is not critical
        }
      }
      
      toast.success("Customer saved successfully!");
      
      // Reset the form
      form.reset();
      
      // Navigate back to customers list after a short delay
      setTimeout(() => {
        navigate("/customers");
      }, 1500);
      
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Failed to save customer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-6">
            <Button 
              type="button" 
              variant={isNewCustomer ? "default" : "outline"}
              onClick={() => setIsNewCustomer(true)}
            >
              New Customer
            </Button>
            <Button 
              type="button" 
              variant={isNewCustomer ? "outline" : "default"}
              onClick={() => setIsNewCustomer(false)}
            >
              Existing Customer
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-8" placeholder="Enter customer name" {...field} />
                          </div>
                        </FormControl>
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
                          <div className="relative">
                            <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-8" placeholder="Enter phone number" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-8" placeholder="Enter email address" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-8" type="date" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address & Classification</h3>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Textarea 
                              placeholder="Enter full address"
                              className="min-h-[80px] pl-8 pt-8"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area/City</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Map className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-8" placeholder="Enter customer area" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="individual" id="individual" />
                              <FormLabel htmlFor="individual" className="font-normal">
                                Individual
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="government" id="government" />
                              <FormLabel htmlFor="government" className="font-normal">
                                Government
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="corporate" id="corporate" />
                              <FormLabel htmlFor="corporate" className="font-normal">
                                Corporate
                              </FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{isNewCustomer ? "Lead Information" : "Machine Information"}</h3>
                  <Separator />

                  {isNewCustomer ? (
                    <>
                      <FormField
                        control={form.control}
                        name="machineInterest"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Machine Interest</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Printer className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Textarea 
                                  placeholder="Enter machines customer is interested in"
                                  className="min-h-[80px] pl-8 pt-8"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="source"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lead Source</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select lead source" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="referral">Referral</SelectItem>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="social_media">Social Media</SelectItem>
                                <SelectItem value="cold_call">Cold Call</SelectItem>
                                <SelectItem value="exhibition">Exhibition</SelectItem>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="leadStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lead Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select lead status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="New">New</SelectItem>
                                <SelectItem value="Quoted">Quoted</SelectItem>
                                <SelectItem value="Follow-up">Follow-up</SelectItem>
                                <SelectItem value="Converted">Converted</SelectItem>
                                <SelectItem value="Lost">Lost</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <div className="p-4 border rounded-md bg-muted/50">
                      <p className="text-muted-foreground text-sm mb-2">
                        Existing customer machines will be displayed here.
                      </p>
                      <Button type="button" variant="outline" size="sm" className="w-full">
                        Add New Machine
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notes</h3>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MessageSquare className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Textarea 
                              placeholder="Add any additional notes here"
                              className="min-h-[120px] pl-8 pt-8"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    Save Customer <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {!isNewCustomer && (
        <div className="grid md:grid-cols-2 gap-6">
          <CustomerMachines />
          <CustomerHistory />
        </div>
      )}

      <CustomerNotes />
    </div>
  );
}
