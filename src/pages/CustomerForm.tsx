
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomerFormComponent from "@/components/customers/CustomerFormComponent";
import LeadPipeline from "@/components/customers/LeadPipeline";
import CustomerMachines from "@/components/customers/CustomerMachines";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerFormProvider, defaultValues, formSchema } from "@/components/customers/CustomerFormContext";
import { useCustomerDetails } from "@/hooks/useCustomerDetails";

const CustomerForm = () => {
  const [activeTab, setActiveTab] = useState("form");
  const { id } = useParams();
  const { customer, isLoading, error } = useCustomerDetails();
  
  // Create form at this level to provide context for all tabs
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  // Update form values when customer data is loaded
  useEffect(() => {
    if (customer) {
      form.reset({
        ...defaultValues,
        id: customer.id,
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        area: customer.location || "",
        leadStatus: customer.status as any || "New",
        // Add other fields as needed
      });
    }
  }, [customer, form]);
  
  const isNewCustomer = !id;
  const isSubmitting = false;

  if (isLoading) {
    return <div className="p-8">Loading customer details...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error loading customer: {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isNewCustomer ? "Add New Customer" : `Edit Customer: ${customer?.name}`}
          </h1>
          <p className="text-muted-foreground">
            {isNewCustomer 
              ? "Add new customers, track existing ones, and manage their lead status" 
              : "Update customer details, track machines, and manage follow-ups"}
          </p>
        </div>
      </div>

      <CustomerFormProvider form={form} isNewCustomer={isNewCustomer} isSubmitting={isSubmitting}>
        <Tabs 
          defaultValue="form" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full bg-muted mb-2">
            <TabsTrigger value="form" className="flex-1">Customer Form</TabsTrigger>
            <TabsTrigger value="machines" className="flex-1">Machines & Follow-ups</TabsTrigger>
            <TabsTrigger value="pipeline" className="flex-1">Lead Pipeline</TabsTrigger>
          </TabsList>
          <TabsContent value="form" className="mt-4">
            <CustomerFormComponent customer={customer} />
          </TabsContent>
          <TabsContent value="machines" className="mt-4">
            <CustomerMachines customerId={id} />
          </TabsContent>
          <TabsContent value="pipeline" className="mt-4">
            <LeadPipeline customerId={id} />
          </TabsContent>
        </Tabs>
      </CustomerFormProvider>
    </div>
  );
};

export default CustomerForm;
