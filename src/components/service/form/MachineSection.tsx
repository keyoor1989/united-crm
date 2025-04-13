import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { ServiceCallFormData } from "@/hooks/useServiceCallForm";
import { UseFormReturn } from "react-hook-form";
import { CustomerType } from "@/types/customer";

interface MachineSectionProps {
  form: UseFormReturn<ServiceCallFormData>;
  customerMachines: any[];
  selectedCustomer: CustomerType | null;
  handleMachineChange: (machineId: string) => void;
}

const MachineSection: React.FC<MachineSectionProps> = ({
  form,
  customerMachines,
  selectedCustomer,
  handleMachineChange
}) => {
  return (
    <Card>
      <div className="space-y-4 p-4">
        <h2 className="text-lg font-medium">Machine Details</h2>
        <p className="text-sm text-muted-foreground">
          Enter the details of the machine requiring service.
        </p>

        {selectedCustomer ? (
          <FormField
            control={form.control}
            name="machine.model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Machine Model</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleMachineChange(e.target.value);
                    }}
                  >
                    <option value="">Select Machine</option>
                    {customerMachines.map((machine: any) => (
                      <option key={machine.id} value={machine.machine_name}>
                        {machine.machine_name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a customer to load their machines.
          </p>
        )}

        <FormField
          control={form.control}
          name="machine.serial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serial Number (Optional)</FormLabel>
              <FormControl>
                <input type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Enter serial number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
};

export default MachineSection;
