
import React, { createContext, useContext } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const formSchema = z.object({
  id: z.string().optional(),
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
  machineType: z.string().optional(),
  leadSource: z.string().min(1, { message: "Please select a source" }),
  notes: z.string().optional(),
  leadStatus: z.enum(["New", "Quoted", "Follow-up", "Converted", "Lost"]),
  isNewCustomer: z.boolean().default(true),
});

export type CustomerFormValues = z.infer<typeof formSchema>;

export const defaultValues: Partial<CustomerFormValues> = {
  id: "",
  name: "",
  phone: "",
  email: "",
  address: "",
  area: "",
  customerType: "individual",
  machineType: "",
  leadSource: "Website",
  notes: "",
  leadStatus: "New",
  isNewCustomer: true,
};

interface CustomerFormContextType {
  form: UseFormReturn<CustomerFormValues>;
  isNewCustomer: boolean;
  isSubmitting: boolean;
}

const CustomerFormContext = createContext<CustomerFormContextType | undefined>(undefined);

export const useCustomerForm = () => {
  const context = useContext(CustomerFormContext);
  if (!context) {
    throw new Error("useCustomerForm must be used within a CustomerFormProvider");
  }
  return context;
};

export const CustomerFormProvider: React.FC<{
  children: React.ReactNode;
  form: UseFormReturn<CustomerFormValues>;
  isNewCustomer: boolean;
  isSubmitting: boolean;
}> = ({ children, form, isNewCustomer, isSubmitting }) => {
  return (
    <CustomerFormContext.Provider value={{ form, isNewCustomer, isSubmitting }}>
      {children}
    </CustomerFormContext.Provider>
  );
};
