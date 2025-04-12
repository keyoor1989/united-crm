
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ServiceCallFormValues } from "@/hooks/useServiceCallForm";
import { Machine } from "@/types/service";

interface MachineSectionProps {
  form: UseFormReturn<ServiceCallFormValues>;
  customerMachines: Machine[];
  selectedCustomer: any;
  handleMachineChange: (machineId: string) => void;
}

const MachineSection: React.FC<MachineSectionProps> = ({
  form,
  customerMachines,
  selectedCustomer,
  handleMachineChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Machine Details</CardTitle>
        <CardDescription>
          Select machine details for this service call
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="machineId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Machine Model</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleMachineChange(value);
                  }}
                  defaultValue={field.value}
                  disabled={!selectedCustomer || customerMachines.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select machine" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customerMachines.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id}>
                        {machine.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Input
                    {...field}
                    placeholder="Enter serial number (optional)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MachineSection;
