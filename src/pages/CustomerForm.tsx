
import React from "react";
import Layout from "@/components/layout/Layout";
import CustomerFormComponent from "@/components/customers/CustomerFormComponent";
import LeadPipeline from "@/components/customers/LeadPipeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const CustomerForm = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Customer</h1>
            <p className="text-muted-foreground">
              Add new customers and manage their lead status
            </p>
          </div>
        </div>

        <Tabs defaultValue="form" className="w-full">
          <TabsList>
            <TabsTrigger value="form">Customer Form</TabsTrigger>
            <TabsTrigger value="pipeline">Lead Pipeline</TabsTrigger>
          </TabsList>
          <TabsContent value="form">
            <div className="mt-4">
              <CustomerFormComponent />
            </div>
          </TabsContent>
          <TabsContent value="pipeline">
            <div className="mt-4">
              <LeadPipeline />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CustomerForm;
