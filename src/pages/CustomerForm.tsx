
import React from "react";
import CustomerFormComponent from "@/components/customers/CustomerFormComponent";
import LeadPipeline from "@/components/customers/LeadPipeline";
import CustomerMachines from "@/components/customers/CustomerMachines";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CustomerForm = () => {
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

      <Tabs defaultValue="form" className="w-full">
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
    </div>
  );
};

export default CustomerForm;
