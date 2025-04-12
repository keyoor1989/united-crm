
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { AMCConsumableUsage, AMCMachine } from "@/types/inventory";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddConsumableUsageDialogProps {
  onUsageAdded: (usage: AMCConsumableUsage) => void;
}

const formSchema = z.object({
  machineId: z.string({ required_error: "Machine is required" }),
  contractId: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  machineModel: z.string(),
  machineType: z.string(),
  serialNumber: z.string(),
  engineerId: z.string().optional(),
  engineerName: z.string().optional(),
  date: z.string().min(1, { message: "Date is required" }),
  itemId: z.string().optional(),
  itemName: z.string().min(1, { message: "Consumable name is required" }),
  quantity: z.string().min(1, { message: "Quantity is required" }),
  cost: z.string().min(1, { message: "Cost is required" }),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddConsumableUsageDialog: React.FC<AddConsumableUsageDialogProps> = ({ onUsageAdded }) => {
  const [open, setOpen] = useState(false);
  const [machines, setMachines] = useState<AMCMachine[]>([]);
  const [engineers, setEngineers] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      quantity: "1",
    },
  });

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const { data, error } = await supabase
          .from('amc_machines')
          .select('*');
        
        if (error) throw error;
        
        // Explicitly cast data to AMCMachine[]
        setMachines(data as AMCMachine[] || []);
      } catch (error) {
        console.error('Error fetching machines:', error);
        toast.error('Failed to load machines');
      }
    };

    const fetchEngineers = async () => {
      try {
        const { data, error } = await supabase
          .from('engineers')
          .select('id, name');
        
        if (error) throw error;
        
        setEngineers(data || []);
      } catch (error) {
        console.error('Error fetching engineers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMachines();
    fetchEngineers();
  }, []);

  const handleMachineChange = (machineId: string) => {
    const selectedMachine = machines.find((m) => m.id === machineId);
    if (selectedMachine) {
      form.setValue("contractId", selectedMachine.contract_id);
      form.setValue("customerId", selectedMachine.customer_id);
      form.setValue("customerName", selectedMachine.customer_name);
      form.setValue("machineModel", selectedMachine.model);
      form.setValue("machineType", selectedMachine.machine_type);
      form.setValue("serialNumber", selectedMachine.serial_number);
    }
  };

  const handleEngineerChange = (engineerId: string) => {
    const selectedEngineer = engineers.find((e) => e.id === engineerId);
    if (selectedEngineer) {
      form.setValue("engineerName", selectedEngineer.name);
    }
  };

  const onSubmit = (values: FormValues) => {
    const newUsage: AMCConsumableUsage = {
      id: uuidv4(),
      contract_id: values.contractId,
      machine_id: values.machineId,
      customer_id: values.customerId,
      customer_name: values.customerName,
      machine_model: values.machineModel,
      machine_type: values.machineType,
      serial_number: values.serialNumber,
      engineer_id: values.engineerId,
      engineer_name: values.engineerName,
      date: values.date,
      item_id: values.itemId,
      item_name: values.itemName,
      quantity: parseInt(values.quantity),
      cost: parseFloat(values.cost),
      remarks: values.remarks,
      inventory_deducted: false,
    };

    onUsageAdded(newUsage);
    toast.success("Consumable usage added successfully");
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Add Consumable Usage
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Consumable Usage</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="machineId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Machine</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleMachineChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a machine" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {machines.map((machine) => (
                        <SelectItem key={machine.id} value={machine.id}>
                          {machine.customer_name} - {machine.model} ({machine.serial_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="engineerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engineer</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleEngineerChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an engineer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {engineers.map((engineer) => (
                          <SelectItem key={engineer.id} value={engineer.id}>
                            {engineer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="itemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consumable</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. TK-1170 Toner" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" className="bg-black hover:bg-gray-800">
                Add Usage
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddConsumableUsageDialog;
