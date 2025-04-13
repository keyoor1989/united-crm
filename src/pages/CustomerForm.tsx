
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomerFormComponent from "@/components/customers/CustomerFormComponent";
import LeadPipeline from "@/components/customers/LeadPipeline";
import CustomerMachines from "@/components/customers/CustomerMachines";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerFormProvider, defaultValues, formSchema } from "@/components/customers/CustomerFormContext";

const CustomerForm = () => {
  const [activeTab, setActiveTab] = useState("form");
  
  // Create form at this level to provide context for all tabs
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  
  const isNewCustomer = true;
  const isSubmitting = false;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Customer</h1>
          <p className="text-muted-foreground">
            Add new customers, track existing ones, and manage their lead status
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
          <TabsList className="bg-secondary">
            <TabsTrigger value="form" className="data-[state=active]:bg-background">Customer Form</TabsTrigger>
            <TabsTrigger value="machines" className="data-[state=active]:bg-background">Machines & Follow-ups</TabsTrigger>
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-background">Lead Pipeline</TabsTrigger>
          </TabsList>
          <TabsContent value="form" className="mt-4">
            <CustomerFormComponent />
          </TabsContent>
          <TabsContent value="machines" className="mt-4">
            <CustomerMachines />
          </TabsContent>
          <TabsContent value="pipeline" className="mt-4">
            <LeadPipeline />
          </TabsContent>
        </Tabs>
      </CustomerFormProvider>
    </div>
  );
};

export default CustomerForm;
