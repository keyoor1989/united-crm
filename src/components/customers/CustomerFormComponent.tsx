
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CustomerType } from "@/types/customer";
import AddressForm from "./form-sections/AddressForm";
import { supabase } from "@/integrations/supabase/client";
import { notifyNewCustomer } from "@/services/telegramService";
import { CustomerFormProvider, defaultValues, formSchema } from "./CustomerFormContext";
import BasicInfoForm from "./form-sections/BasicInfoForm";
import LeadInfoForm from "./form-sections/LeadInfoForm";
import NotesForm from "./form-sections/NotesForm";

interface CustomerFormComponentProps {
  customer?: CustomerType;
}

const CustomerFormComponent: React.FC<CustomerFormComponentProps> = ({ customer: selectedCustomer }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Define form with the proper type
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
      name: selectedCustomer?.name || "",
      phone: selectedCustomer?.phone || "",
      email: selectedCustomer?.email || "",
      leadSource: "Website",
      leadStatus: (selectedCustomer?.status as any) || "New",
      address: selectedCustomer?.location || "",
      area: selectedCustomer?.location || "",
      customerType: "individual" as "individual" | "government" | "corporate"
    },
  });

  const handleSubmit = async (values: any) => {
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

  const isNewCustomer = !selectedCustomer;

  // Use form directly, don't create a new provider here
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BasicInfoForm />
          <AddressForm />
          <LeadInfoForm />
          <NotesForm />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : selectedCustomer ? "Update Customer" : "Add Customer"}
        </Button>
      </form>
    </Form>
  );
};

export default CustomerFormComponent;
