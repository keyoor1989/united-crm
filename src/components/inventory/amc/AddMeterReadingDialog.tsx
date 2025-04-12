
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
import { Plus } from "lucide-react";
import { AMCBilling, AMCMachine, AMCContract } from "@/types/inventory";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddMeterReadingDialogProps {
  onMeterReadingAdded: (billing: AMCBilling) => void;
}

const formSchema = z.object({
  machineId: z.string({ required_error: "Machine is required" }),
  contractId: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  machineModel: z.string(),
  machineType: z.string(),
  serialNumber: z.string(),
  billingMonth: z.string().min(1, { message: "Billing month is required" }),
  a4OpeningReading: z.string().min(1, { message: "A4 opening reading is required" }),
  a4ClosingReading: z.string().min(1, { message: "A4 closing reading is required" }),
  a3OpeningReading: z.string().default("0"),
  a3ClosingReading: z.string().default("0"),
  billDate: z.string().min(1, { message: "Bill date is required" }),
});

type FormValues = z.infer<typeof formSchema>;

const AddMeterReadingDialog: React.FC<AddMeterReadingDialogProps> = ({ onMeterReadingAdded }) => {
  const [open, setOpen] = useState(false);
  const [machines, setMachines] = useState<AMCMachine[]>([]);
  const [contracts, setContracts] = useState<AMCContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [a4Total, setA4Total] = useState(0);
  const [a4Extra, setA4Extra] = useState(0);
  const [a4ExtraCharge, setA4ExtraCharge] = useState(0);
  
  const [a3Total, setA3Total] = useState(0);
  const [a3Extra, setA3Extra] = useState(0);
  const [a3ExtraCharge, setA3ExtraCharge] = useState(0);
  
  const [selectedMachine, setSelectedMachine] = useState<AMCMachine | null>(null);
  const [selectedContract, setSelectedContract] = useState<AMCContract | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billingMonth: new Date().toISOString().split('T')[0],
      billDate: new Date().toISOString().split('T')[0],
      a3OpeningReading: "0",
      a3ClosingReading: "0",
    },
  });

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const { data, error } = await supabase
          .from('amc_machines')
          .select('*');
        
        if (error) throw error;
        
        setMachines(data || []);
      } catch (error) {
        console.error('Error fetching machines:', error);
        toast.error('Failed to load machines');
      }
    };

    const fetchContracts = async () => {
      try {
        const { data, error } = await supabase
          .from('amc_contracts')
          .select('*');
        
        if (error) throw error;
        
        setContracts(data || []);
      } catch (error) {
        console.error('Error fetching contracts:', error);
        toast.error('Failed to load contracts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMachines();
    fetchContracts();
  }, []);

  const handleMachineChange = (machineId: string) => {
    const machine = machines.find((m) => m.id === machineId);
    if (machine) {
      setSelectedMachine(machine);
      
      const contract = contracts.find((c) => c.id === machine.contractId);
      if (contract) {
        setSelectedContract(contract);
      }
      
      form.setValue("contractId", machine.contractId);
      form.setValue("customerId", machine.customerId);
      form.setValue("customerName", machine.customerName);
      form.setValue("machineModel", machine.model);
      form.setValue("machineType", machine.machineType);
      form.setValue("serialNumber", machine.serialNumber);
      form.setValue("a4OpeningReading", machine.last_a4_reading?.toString() || "0");
      form.setValue("a3OpeningReading", machine.last_a3_reading?.toString() || "0");
    }
  };

  // Calculate totals when readings change
  useEffect(() => {
    const a4Opening = parseInt(form.watch("a4OpeningReading") || "0");
    const a4Closing = parseInt(form.watch("a4ClosingReading") || "0");
    const a3Opening = parseInt(form.watch("a3OpeningReading") || "0");
    const a3Closing = parseInt(form.watch("a3ClosingReading") || "0");
    
    // A4 calculations
    const a4TotalCopies = Math.max(0, a4Closing - a4Opening);
    setA4Total(a4TotalCopies);
    
    const a4FreeLimit = selectedMachine?.copy_limit_a4 || 0;
    const a4ExtraCopies = Math.max(0, a4TotalCopies - a4FreeLimit);
    setA4Extra(a4ExtraCopies);
    
    const a4Rate = selectedContract?.extraA4CopyCharge || 0;
    setA4ExtraCharge(a4ExtraCopies * a4Rate);
    
    // A3 calculations
    const a3TotalCopies = Math.max(0, a3Closing - a3Opening);
    setA3Total(a3TotalCopies);
    
    const a3FreeLimit = selectedMachine?.copy_limit_a3 || 0;
    const a3ExtraCopies = Math.max(0, a3TotalCopies - a3FreeLimit);
    setA3Extra(a3ExtraCopies);
    
    const a3Rate = selectedContract?.extraA3CopyCharge || 0;
    setA3ExtraCharge(a3ExtraCopies * a3Rate);
    
  }, [form.watch("a4OpeningReading"), form.watch("a4ClosingReading"), 
      form.watch("a3OpeningReading"), form.watch("a3ClosingReading"), 
      selectedMachine, selectedContract]);

  const onSubmit = (values: FormValues) => {
    if (!selectedContract || !selectedMachine) {
      toast.error("Please select a valid machine and ensure contract details are loaded");
      return;
    }
    
    const a4Opening = parseInt(values.a4OpeningReading);
    const a4Closing = parseInt(values.a4ClosingReading);
    
    if (a4Closing < a4Opening) {
      toast.error("A4 closing reading cannot be less than opening reading");
      return;
    }
    
    const a3Opening = parseInt(values.a3OpeningReading);
    const a3Closing = parseInt(values.a3ClosingReading);
    
    if (a3Closing < a3Opening) {
      toast.error("A3 closing reading cannot be less than opening reading");
      return;
    }
    
    const rent = selectedContract.monthlyRent;
    const gstPercent = selectedContract.gstPercent;
    const rentGst = (rent * gstPercent) / 100;
    
    const extraCopyTotal = a4ExtraCharge + a3ExtraCharge;
    const extraCopyGst = (extraCopyTotal * gstPercent) / 100;
    
    const totalBill = rent + rentGst + extraCopyTotal + extraCopyGst;
    
    const newBilling: AMCBilling = {
      id: uuidv4(),
      contractId: values.contractId,
      machineId: values.machineId,
      customerId: values.customerId,
      customerName: values.customerName,
      machineModel: values.machineModel,
      machineType: values.machineType as "Black & White" | "Color",
      serialNumber: values.serialNumber,
      department: selectedMachine.department,
      billing_month: values.billingMonth,
      a4_opening_reading: a4Opening,
      a4_closing_reading: a4Closing,
      a4_total_copies: a4Total,
      a4_free_copies: selectedMachine.copy_limit_a4,
      a4_extra_copies: a4Extra,
      a4_extra_copy_rate: selectedContract.extraA4CopyCharge,
      a4_extra_copy_charge: a4ExtraCharge,
      a3_opening_reading: a3Opening,
      a3_closing_reading: a3Closing,
      a3_total_copies: a3Total,
      a3_free_copies: selectedMachine.copy_limit_a3 || 0,
      a3_extra_copies: a3Extra,
      a3_extra_copy_rate: selectedContract.extraA3CopyCharge,
      a3_extra_copy_charge: a3ExtraCharge,
      gst_percent: gstPercent,
      gst_amount: rentGst + extraCopyGst,
      rent: rent,
      rent_gst: rentGst,
      total_bill: totalBill,
      bill_date: values.billDate,
      bill_status: "Pending",
      created_at: new Date().toISOString(),
    };

    onMeterReadingAdded(newBilling);
    toast.success("Meter reading added successfully");
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Add Meter Reading
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Meter Reading & Generate Bill</DialogTitle>
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
                          {machine.customerName} - {machine.model} ({machine.serialNumber})
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
                name="billingMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Month</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">A4 Counter</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="a4OpeningReading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Reading</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="a4ClosingReading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Reading</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Copies:</span>
                    <span>{a4Total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Free Limit:</span>
                    <span>{selectedMachine?.copy_limit_a4 || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Extra Copies:</span>
                    <span>{a4Extra}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Extra Charge:</span>
                    <span>₹{a4ExtraCharge.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">A3 Counter</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="a3OpeningReading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Reading</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="a3ClosingReading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Reading</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Copies:</span>
                    <span>{a3Total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Free Limit:</span>
                    <span>{selectedMachine?.copy_limit_a3 || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Extra Copies:</span>
                    <span>{a3Extra}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Extra Charge:</span>
                    <span>₹{a3ExtraCharge.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-gray-50 p-4 mt-4">
              <h3 className="text-sm font-medium mb-2">Bill Summary</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Monthly Rent:</span>
                  <span>₹{selectedContract?.monthlyRent.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST on Rent ({selectedContract?.gstPercent || 18}%):</span>
                  <span>₹{selectedContract ? ((selectedContract.monthlyRent * selectedContract.gstPercent) / 100).toFixed(2) : "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Extra Copy Charges:</span>
                  <span>₹{(a4ExtraCharge + a3ExtraCharge).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST on Extra Copies ({selectedContract?.gstPercent || 18}%):</span>
                  <span>₹{selectedContract ? (((a4ExtraCharge + a3ExtraCharge) * selectedContract.gstPercent) / 100).toFixed(2) : "0.00"}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t border-gray-200 mt-2">
                  <span>Total Bill Amount:</span>
                  <span>₹{selectedContract 
                    ? (selectedContract.monthlyRent + 
                       (selectedContract.monthlyRent * selectedContract.gstPercent / 100) + 
                       (a4ExtraCharge + a3ExtraCharge) + 
                       ((a4ExtraCharge + a3ExtraCharge) * selectedContract.gstPercent / 100)).toFixed(2) 
                    : "0.00"}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-black hover:bg-gray-800">
                Save & Generate Bill
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMeterReadingDialog;
