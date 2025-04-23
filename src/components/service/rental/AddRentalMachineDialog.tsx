
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  model: z.string().min(1, "Model is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientId: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  monthlyRent: z.string().min(1, "Monthly rent is required"),
  copyLimitA4: z.string().optional(),
  copyLimitA3: z.string().optional(),
  extraA4CopyCharge: z.string().optional(),
  extraA3CopyCharge: z.string().optional(),
  department: z.string().optional(),
  initialA4Reading: z.string().optional(),
  initialA3Reading: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddRentalMachineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMachineAdded: () => void;
}

const AddRentalMachineDialog: React.FC<AddRentalMachineDialogProps> = ({
  open,
  onOpenChange,
  onMachineAdded,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "",
      serialNumber: "",
      clientName: "",
      location: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyRent: "",
      copyLimitA4: "",
      copyLimitA3: "",
      extraA4CopyCharge: "0",
      extraA3CopyCharge: "0",
      department: "",
      initialA4Reading: "0",
      initialA3Reading: "0",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // First, create a contract record to get a contract_id
      const { data: contractData, error: contractError } = await supabase.from('amc_contracts').insert({
        machine_model: values.model,
        serial_number: values.serialNumber,
        customer_name: values.clientName,
        customer_id: values.clientId || null,
        machine_type: 'Copier',
        contract_type: 'Rental',
        start_date: values.startDate,
        end_date: values.endDate,
        monthly_rent: parseFloat(values.monthlyRent),
        copy_limit_a4: values.copyLimitA4 ? parseInt(values.copyLimitA4) : 0,
        copy_limit_a3: values.copyLimitA3 ? parseInt(values.copyLimitA3) : 0,
        extra_a4_copy_charge: values.extraA4CopyCharge ? parseFloat(values.extraA4CopyCharge) : 0,
        extra_a3_copy_charge: values.extraA3CopyCharge ? parseFloat(values.extraA3CopyCharge) : 0,
        department: values.department || null,
        location: values.location,
        status: 'Active',
        billing_cycle: 'Monthly'
      }).select('id').single();

      if (contractError) throw contractError;
      
      // Then insert into amc_machines table with the contract_id
      const { error: machineError } = await supabase.from('amc_machines').insert({
        model: values.model,
        serial_number: values.serialNumber,
        customer_name: values.clientName,
        customer_id: values.clientId || null,
        location: values.location,
        start_date: values.startDate,
        end_date: values.endDate,
        current_rent: parseFloat(values.monthlyRent),
        copy_limit_a4: values.copyLimitA4 ? parseInt(values.copyLimitA4) : 0,
        copy_limit_a3: values.copyLimitA3 ? parseInt(values.copyLimitA3) : 0,
        department: values.department || null,
        machine_type: 'Copier',
        contract_type: 'Rental',
        contract_id: contractData.id, // Using the contract_id from the created contract
        last_a4_reading: values.initialA4Reading ? parseInt(values.initialA4Reading) : 0,
        last_a3_reading: values.initialA3Reading ? parseInt(values.initialA3Reading) : 0,
        last_reading_date: values.startDate
      });

      if (machineError) throw machineError;

      toast.success("Rental machine added successfully");
      form.reset();
      onMachineAdded();
      onOpenChange(false);
    } catch (err) {
      console.error("Error adding rental machine:", err);
      toast.error("Failed to add rental machine");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Rental Machine</DialogTitle>
          <DialogDescription>Enter machine details including rental terms and initial readings</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. IRC3020" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. ABC123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Client name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Indore Office" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monthlyRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rent</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Rental" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="copyLimitA4"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>A4 Copy Limit</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="copyLimitA3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>A3 Copy Limit</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="extraA4CopyCharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>A4 Per Copy Charge (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 0.50" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="extraA3CopyCharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>A3 Per Copy Charge (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 1.00" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <FormField
                control={form.control}
                name="initialA4Reading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial A4 Reading</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="initialA3Reading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial A3 Reading</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Machine"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRentalMachineDialog;
