
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CustomerType } from "@/types/customer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerForm } from "./CustomerFormContext";
import AddressForm from "./form-sections/AddressForm";
import { supabase } from "@/integrations/supabase/client";
import { notifyNewCustomer } from "@/services/telegramService";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  leadSource: z.string().min(2, {
    message: "Lead source must be at least 2 characters.",
  }),
  leadStatus: z.enum(["New", "Quoted", "Follow-up", "Converted", "Lost"]),
  address: z.string().optional(),
  area: z.string().optional(),
  customerType: z.enum(["individual", "government", "corporate"]).optional(),
});

interface CustomerFormComponentProps {
  customer?: CustomerType;
}

type CustomerFormValues = z.infer<typeof formSchema>;

const CustomerFormComponent: React.FC<CustomerFormComponentProps> = ({ customer: selectedCustomer }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Define your form.
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: selectedCustomer?.name || "",
      phone: selectedCustomer?.phone || "",
      email: selectedCustomer?.email || "",
      leadSource: "Website",
      leadStatus: (selectedCustomer?.status as any) || "New",
      address: selectedCustomer?.location || "",
      area: selectedCustomer?.location || "",
      customerType: "individual"
    },
  });

  useCustomerForm().form = form;

  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create the customer object
      const customer: CustomerType = {
        id: selectedCustomer?.id || uuidv4(),
        name: values.name,
        phone: values.phone,
        email: values.email || "",
        location: values.area || "",
        lastContact: "Just now",
        machines: [],
        status: values.leadStatus as any
      };
      
      // Save to Supabase
      const { error } = await supabase
        .from("customers")
        .upsert({
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          area: customer.location,
          lead_status: values.leadStatus,
          source: values.leadSource,
          customer_type: values.customerType,
          address: values.address
        });
        
      if (error) throw error;
      
      // If this is a new customer, notify via Telegram
      if (!selectedCustomer) {
        await notifyNewCustomer(customer);
      }
      
      toast({
        title: selectedCustomer ? "Customer updated" : "Customer added",
        description: selectedCustomer ? "Customer updated successfully" : "Customer added successfully"
      });
      
      navigate("/customers");
    } catch (error) {
      console.error("Error saving customer:", error);
      toast({
        title: "Error",
        description: "Failed to save customer",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter customer name" {...field} />
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
                  <Input placeholder="Enter phone number" {...field} />
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
                <FormLabel>Email Address (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leadSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Source</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lead source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Advertisement">Advertisement</SelectItem>
                    <SelectItem value="Cold Call">Cold Call</SelectItem>
                    <SelectItem value="Chatbot">Chatbot</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
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
                      <SelectValue placeholder="Select a lead status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Contract Renewal">Contract Renewal</SelectItem>
                    <SelectItem value="Need Toner">Need Toner</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <AddressForm />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : selectedCustomer ? "Update Customer" : "Add Customer"}
        </Button>
      </form>
    </Form>
  );
};

export default CustomerFormComponent;
