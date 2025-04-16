
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomerFormComponent from "@/components/customers/CustomerFormComponent";
import LeadPipeline from "@/components/customers/LeadPipeline";
import CustomerMachines from "@/components/customers/CustomerMachines";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerFormProvider, defaultValues, formSchema } from "@/components/customers/CustomerFormContext";
import { useCustomerDetails } from "@/hooks/useCustomerDetails";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const CustomerForm = () => {
  const [activeTab, setActiveTab] = useState("form");
  const [isNewCustomerMode, setIsNewCustomerMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
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
        address: customer.location || "", 
        leadStatus: customer.status as any || "New",
        // Add other fields as needed
      });
      setIsNewCustomerMode(false);
    }
  }, [customer, form]);
  
  const isNewCustomer = !id;

  // Toggle between New Customer and Existing Customer modes
  const toggleCustomerMode = (mode: boolean) => {
    setIsNewCustomerMode(mode);
    if (mode && !isNewCustomer) {
      // If switching to "New Customer" mode while editing an existing customer,
      // reset the form
      form.reset(defaultValues);
    } else if (!mode && isNewCustomer) {
      // If switching to "Existing Customer" mode in a new customer form,
      // navigate to customers page to select an existing one
      navigate("/customers");
    }
  };

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
        <Button variant="outline" onClick={() => navigate("/customers")}>
          Back to Customers
        </Button>
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
            <TabsTrigger value="machines" className="flex-1" disabled={isNewCustomer}>Machines & Follow-ups</TabsTrigger>
            <TabsTrigger value="pipeline" className="flex-1" disabled={isNewCustomer}>Lead Pipeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="mt-4">
            <div className="bg-white p-6 rounded-lg border">
              {/* Toggle buttons for New/Existing Customer */}
              <div className="flex space-x-2 mb-6">
                <Button 
                  variant={isNewCustomerMode ? "default" : "outline"}
                  className="bg-black text-white hover:bg-gray-800"
                  onClick={() => toggleCustomerMode(true)}
                >
                  New Customer
                </Button>
                <Button 
                  variant={!isNewCustomerMode ? "default" : "outline"}
                  className={!isNewCustomerMode ? "bg-white text-black border border-gray-300" : ""}
                  onClick={() => toggleCustomerMode(false)}
                >
                  Existing Customer
                </Button>
              </div>
              
              <CustomerFormComponent customer={customer} />
            </div>
          </TabsContent>
          
          {!isNewCustomer && (
            <>
              <TabsContent value="machines" className="mt-4">
                <CustomerMachines 
                  customerId={id} 
                  customerName={customer?.name}
                  customerLocation={customer?.location}
                  customerPhone={customer?.phone}
                />
              </TabsContent>
              <TabsContent value="pipeline" className="mt-4">
                <LeadPipeline customerId={id} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </CustomerFormProvider>
    </div>
  );
};

export default CustomerForm;
