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
import { CalendarClock } from "lucide-react";
import { AMCBilling, AMCContract, AMCMachine, dbAdapter } from "@/types/inventory";
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
  department: z.string().optional(),
  billingMonth: z.string().min(1, { message: "Billing month is required" }),
  a4OpeningReading: z.string(),
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
  const [selectedContract, setSelectedContract] = useState<AMCContract | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<AMCMachine | null>(null);
  const [a4TotalCopies, setA4TotalCopies] = useState(0);
  const [a3TotalCopies, setA3TotalCopies] = useState(0);
  const [a4ExtraCopies, setA4ExtraCopies] = useState(0);
  const [a3ExtraCopies, setA3ExtraCopies] = useState(0);
  const [a4TotalCharge, setA4TotalCharge] = useState(0);
  const [a3TotalCharge, setA3TotalCharge] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billingMonth: new Date().toISOString().split('T')[0].substring(0, 7) + "-01", // YYYY-MM-01
      billDate: new Date().toISOString().split('T')[0],
      a4OpeningReading: "0",
      a3OpeningReading: "0",
      a3ClosingReading: "0"
    },
  });

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const { data, error } = await supabase
          .from('amc_machines')
          .select('*');
        
        if (error) throw error;
        
        // Use the adapter to convert db format to frontend format
        const adaptedMachines = data.map(machine => dbAdapter.adaptAMCMachine(machine));
        setMachines(adaptedMachines);
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
        
        // Use the adapter to convert db format to frontend format
        const adaptedContracts = data.map(contract => dbAdapter.adaptAMCContract(contract));
        setContracts(adaptedContracts);
      } catch (error) {
        console.error('Error fetching contracts:', error);
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
      
      // Find the related contract
      const contract = contracts.find((c) => c.id === machine.contractId);
      setSelectedContract(contract || null);
      
      form.setValue("contractId", machine.contractId);
      form.setValue("customerId", machine.customerId);
      form.setValue("customerName", machine.customerName);
      form.setValue("machineModel", machine.model);
      form.setValue("machineType", machine.machineType);
      form.setValue("serialNumber", machine.serialNumber);
      form.setValue("department", machine.department || '');
      
      // Set opening readings from the machine's last readings
      form.setValue("a4OpeningReading", machine.lastA4Reading.toString());
      form.setValue("a3OpeningReading", machine.lastA3Reading.toString());
    }
  };

  // Calculate copies & charges when readings change
  useEffect(() => {
    const a4Opening = parseInt(form.watch("a4OpeningReading") || "0");
    const a4Closing = parseInt(form.watch("a4ClosingReading") || "0");
    const a3Opening = parseInt(form.watch("a3OpeningReading") || "0");
    const a3Closing = parseInt(form.watch("a3ClosingReading") || "0");

    // Only calculate if we have valid numbers and they make sense
    if (a4Closing >= a4Opening) {
      const totalA4 = a4Closing - a4Opening;
      setA4TotalCopies(totalA4);
      
      // Calculate extra copies based on contract limit
      if (selectedMachine && selectedContract) {
        const a4Limit = selectedMachine.copyLimitA4;
        const extraA4 = totalA4 > a4Limit ? totalA4 - a4Limit : 0;
        setA4ExtraCopies(extraA4);
        
        // Calculate charges
        const a4ExtraRate = selectedContract.extraA4CopyCharge;
        setA4TotalCharge(extraA4 * a4ExtraRate);
      }
    }
    
    // Same for A3
    if (a3Closing >= a3Opening) {
      const totalA3 = a3Closing - a3Opening;
      setA3TotalCopies(totalA3);
      
      if (selectedMachine && selectedContract) {
        const a3Limit = selectedMachine.copyLimitA3;
        const extraA3 = totalA3 > a3Limit ? totalA3 - a3Limit : 0;
        setA3ExtraCopies(extraA3);
        
        const a3ExtraRate = selectedContract.extraA3CopyCharge;
        setA3TotalCharge(extraA3 * a3ExtraRate);
      }
    }
  }, [form.watch("a4OpeningReading"), form.watch("a4ClosingReading"), form.watch("a3OpeningReading"), form.watch("a3ClosingReading"), selectedMachine, selectedContract]);
  
  // Calculate grand total
  useEffect(() => {
    if (selectedContract) {
      const baseRent = selectedContract.monthlyRent;
      const gstPercent = selectedContract.gstPercent;
      const rentGst = (baseRent * gstPercent) / 100;
      
      const extraCopyAmount = a4TotalCharge + a3TotalCharge;
      const extraCopyGst = (extraCopyAmount * gstPercent) / 100;
      
      const total = baseRent + rentGst + extraCopyAmount + extraCopyGst;
      setGrandTotal(total);
    }
  }, [a4TotalCharge, a3TotalCharge, selectedContract]);

  const onSubmit = (values: FormValues) => {
    if (!selectedMachine || !selectedContract) {
      toast.error("Machine or contract details missing");
      return;
    }
    
    const a4Opening = parseInt(values.a4OpeningReading);
    const a4Closing = parseInt(values.a4ClosingReading);
    const a3Opening = parseInt(values.a3OpeningReading || "0");
    const a3Closing = parseInt(values.a3ClosingReading || "0");
    
    const newBilling: AMCBilling = {
      id: uuidv4(),
      contractId: values.contractId,
      machineId: values.machineId,
      customerId: values.customerId,
      customerName: values.customerName,
      machineModel: values.machineModel,
      machineType: values.machineType,
      serialNumber: values.serialNumber,
      department: values.department,
      billingMonth: values.billingMonth,
      a4OpeningReading: a4Opening,
      a4ClosingReading: a4Closing,
      a4TotalCopies: a4TotalCopies,
      a4FreeCopies: selectedMachine.copyLimitA4,
      a4ExtraCopies: a4ExtraCopies,
      a4ExtraCopyRate: selectedContract.extraA4CopyCharge,
      a4ExtraCopyCharge: a4TotalCharge,
      a3OpeningReading: a3Opening,
      a3ClosingReading: a3Closing,
      a3TotalCopies: a3TotalCopies,
      a3FreeCopies: selectedMachine.copyLimitA3,
      a3ExtraCopies: a3ExtraCopies,
      a3ExtraCopyRate: selectedContract.extraA3CopyCharge,
      a3ExtraCopyCharge: a3TotalCharge,
      gstPercent: selectedContract.gstPercent,
      gstAmount: (a4TotalCharge + a3TotalCharge) * (selectedContract.gstPercent / 100),
      rent: selectedContract.monthlyRent,
      rentGst: selectedContract.monthlyRent * (selectedContract.gstPercent / 100),
      totalBill: grandTotal,
      billDate: values.billDate,
      billStatus: "Pending",
      createdAt: new Date().toISOString()
    };

    onMeterReadingAdded(newBilling);
    toast.success("Meter reading added and bill generated successfully");
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black hover:bg-gray-800">
          <CalendarClock className="h-4 w-4 mr-2" />
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
                      <Input type="month" {...field} />
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

            <div className="rounded-md border p-4 mb-4">
              <h3 className="font-medium mb-2">A4 Readings</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="a4OpeningReading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Reading</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} readOnly />
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
                        <Input type="number" min={form.watch("a4OpeningReading")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Total Copies:</span>
                  <span className="ml-2">{a4TotalCopies}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Free Copies:</span>
                  <span className="ml-2">{selectedMachine?.copyLimitA4 || 0}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Extra Copies:</span>
                  <span className="ml-2">{a4ExtraCopies}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Charge:</span>
                  <span className="ml-2">₹{a4TotalCharge.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {selectedMachine?.machineType === "Color" && (
              <div className="rounded-md border p-4 mb-4">
                <h3 className="font-medium mb-2">A3 Readings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="a3OpeningReading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Reading</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} readOnly />
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
                          <Input type="number" min={form.watch("a3OpeningReading")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Total Copies:</span>
                    <span className="ml-2">{a3TotalCopies}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Free Copies:</span>
                    <span className="ml-2">{selectedMachine?.copyLimitA3 || 0}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Extra Copies:</span>
                    <span className="ml-2">{a3ExtraCopies}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Charge:</span>
                    <span className="ml-2">₹{a3TotalCharge.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-md border p-4 mb-4 bg-gray-50">
              <h3 className="font-medium mb-2">Billing Summary</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Monthly Rent:</span>
                  <span className="ml-2">₹{selectedContract?.monthlyRent.toFixed(2) || '0.00'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Rent GST ({selectedContract?.gstPercent || 0}%):</span>
                  <span className="ml-2">₹{selectedContract ? (selectedContract.monthlyRent * selectedContract.gstPercent / 100).toFixed(2) : '0.00'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Extra Copy Charges:</span>
                  <span className="ml-2">₹{(a4TotalCharge + a3TotalCharge).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Extra Charges GST ({selectedContract?.gstPercent || 0}%):</span>
                  <span className="ml-2">₹{selectedContract ? ((a4TotalCharge + a3TotalCharge) * selectedContract.gstPercent / 100).toFixed(2) : '0.00'}</span>
                </div>
                <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                  <span className="text-base font-bold">Total Bill:</span>
                  <span className="ml-2 font-bold">₹{grandTotal.toFixed(2)}</span>
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
