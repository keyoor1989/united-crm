
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import CustomerNotes from "./CustomerNotes";
import CustomerMachines from "./CustomerMachines";
import CustomerHistory from "./CustomerHistory";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  CustomerFormProvider, 
  formSchema, 
  defaultValues, 
  CustomerFormValues 
} from "./CustomerFormContext";
import BasicInfoForm from "./form-sections/BasicInfoForm";
import AddressForm from "./form-sections/AddressForm";
import LeadInfoForm from "./form-sections/LeadInfoForm";
import NotesForm from "./form-sections/NotesForm";

export default function CustomerFormComponent() {
  const { id: customerId } = useParams<{ id: string }>();
  const [isNewCustomer, setIsNewCustomer] = useState<boolean>(!customerId);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState<any>(null);
  const navigate = useNavigate();
  
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Fetch customer data if editing an existing customer
  useEffect(() => {
    if (customerId) {
      setIsLoading(true);
      fetchCustomerData(customerId);
    }
  }, [customerId]);

  const fetchCustomerData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error("Error fetching customer:", error);
        toast.error("Failed to load customer information");
        return;
      }
      
      if (data) {
        setCustomerData(data);
        
        // Safely map returned data to the expected types
        const customerType = ["individual", "government", "corporate"].includes(data.customer_type) 
          ? data.customer_type as "individual" | "government" | "corporate" 
          : "individual";
          
        const leadStatus = ["New", "Quoted", "Follow-up", "Converted", "Lost"].includes(data.lead_status)
          ? data.lead_status as "New" | "Quoted" | "Follow-up" | "Converted" | "Lost"
          : "New";
        
        // The source field is not in the database schema, so we handle it safely
        // by providing a default empty string
        const sourceValue = ""; // Default empty string since source field doesn't exist yet
        
        // Update form with customer data
        form.reset({
          name: data.name,
          phone: data.phone,
          email: data.email || "",
          address: data.address || "",
          area: data.area,
          customerType: customerType,
          dateOfBirth: data.date_of_birth || "",
          machineInterest: "",
          machineType: "",
          source: sourceValue, // Using our default value
          notes: "",
          leadStatus: leadStatus,
          isNewCustomer: false
        });
      }
    } catch (err) {
      console.error("Unexpected error fetching customer:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(data: CustomerFormValues) {
    setIsSubmitting(true);
    console.log("Form submission started with data:", data);
    
    try {
      // Prepare the customer data
      const customerData = {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        area: data.area,
        customer_type: data.customerType,
        date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null,
        lead_status: data.leadStatus,
        last_contact: new Date().toISOString(),
        source: data.source
      };
      
      let customerId;
      
      if (isNewCustomer) {
        console.log("Attempting to insert customer with data:", customerData);
        
        // Insert new customer
        const { data: insertedCustomer, error: customerError } = await supabase
          .from('customers')
          .insert(customerData)
          .select('id')
          .single();
        
        if (customerError) {
          console.error("Error saving customer:", customerError);
          toast.error("Failed to save customer: " + customerError.message);
          return;
        }
        
        if (!insertedCustomer || !insertedCustomer.id) {
          console.error("No customer ID returned after insert");
          toast.error("Failed to save customer: No ID returned");
          return;
        }
        
        customerId = insertedCustomer.id;
        console.log("Customer saved successfully with ID:", customerId);
      } else {
        // Update existing customer
        const { error: updateError } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', customerId);
          
        if (updateError) {
          console.error("Error updating customer:", updateError);
          toast.error("Failed to update customer: " + updateError.message);
          return;
        }
        
        console.log("Customer updated successfully:", customerId);
      }
      
      // Create an array to hold our promises
      const promises = [];
      
      // Handle machine interest if provided for new customers
      if (isNewCustomer && data.machineInterest) {
        const machineData = {
          customer_id: customerId,
          machine_name: data.machineInterest,
          machine_type: data.machineType || null
        };
        
        console.log("Inserting machine data:", machineData);
        
        const machinePromise = supabase
          .from('customer_machines')
          .insert(machineData)
          .then(({ error }) => {
            if (error) {
              console.error("Error saving machine interest:", error);
              toast.error("Warning: Machine data not saved - " + error.message);
            } else {
              console.log("Machine data saved successfully");
            }
          });
        
        promises.push(machinePromise);
      }
      
      // Handle notes if provided
      if (data.notes) {
        const noteData = {
          customer_id: customerId,
          content: data.notes,
          created_by: "System"
        };
        
        console.log("Inserting note data:", noteData);
        
        const notePromise = supabase
          .from('customer_notes')
          .insert(noteData)
          .then(({ error }) => {
            if (error) {
              console.error("Error saving customer notes:", error);
              toast.error("Warning: Notes not saved - " + error.message);
            } else {
              console.log("Notes saved successfully");
            }
          });
        
        promises.push(notePromise);
      }
      
      // Wait for all promises to complete
      await Promise.all(promises);
      
      toast.success(isNewCustomer ? "Customer saved successfully!" : "Customer updated successfully!");
      
      // Reset the form if it's a new customer
      if (isNewCustomer) {
        form.reset();
      }
      
      // Navigate back to customers list after a short delay
      setTimeout(() => {
        navigate("/customers");
      }, 1500);
      
    } catch (error) {
      console.error("Unexpected error in form submission:", error);
      toast.error("Failed to save customer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading customer data...</span>
      </div>
    );
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
              disabled={!!customerId}
            >
              New Customer
            </Button>
            <Button 
              type="button" 
              variant={isNewCustomer ? "outline" : "default"}
              onClick={() => setIsNewCustomer(false)}
              disabled={!!customerId}
            >
              Existing Customer
            </Button>
          </div>

          <CustomerFormProvider form={form} isNewCustomer={isNewCustomer} isSubmitting={isSubmitting}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <BasicInfoForm />
                  <AddressForm />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <LeadInfoForm />
                  <NotesForm />
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
                      {isNewCustomer ? "Save Customer" : "Update Customer"} <Check className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CustomerFormProvider>
        </CardContent>
      </Card>

      {!isNewCustomer && customerId && (
        <div className="grid md:grid-cols-2 gap-6">
          <CustomerMachines />
          <CustomerHistory />
        </div>
      )}

      {!isNewCustomer && customerId && <CustomerNotes />}
    </div>
  );
}
