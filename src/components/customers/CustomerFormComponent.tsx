
import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";
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
  const [isNewCustomer, setIsNewCustomer] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

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
        last_contact: new Date().toISOString()
      };
      
      console.log("Attempting to insert customer with data:", customerData);
      
      // First, ensure we insert the customer and get the ID back
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
      
      const newCustomerId = insertedCustomer.id;
      console.log("Customer saved successfully with ID:", newCustomerId);
      
      // Create an array to hold our promises
      const promises = [];
      
      // Handle machine interest if provided
      if (data.machineInterest) {
        const machineData = {
          customer_id: newCustomerId,
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
          customer_id: newCustomerId,
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
      
      toast.success("Customer saved successfully!");
      
      // Reset the form
      form.reset();
      
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
                      Save Customer <Check className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CustomerFormProvider>
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
