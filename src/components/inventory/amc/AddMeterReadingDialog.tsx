
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { AMCContract, AMCMachine } from "@/types/inventory";
import { format } from "date-fns";

// Define the form schema
const formSchema = z.object({
  machineId: z.string().min(1, "Machine is required"),
  month: z.string().min(1, "Month is required"),
  openingReading: z.coerce.number().nonnegative("Reading cannot be negative"),
  closingReading: z.coerce.number().nonnegative("Reading cannot be negative"),
});

type FormValues = z.infer<typeof formSchema>;

// Generate last 12 months for selection
const getMonthOptions = () => {
  const options = [];
  const today = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = format(date, "MMMM yyyy");
    options.push({ value, label: value });
  }
  
  return options;
};

// Mock data for the demo
const mockMachines = [
  { 
    id: "machine001", 
    contractId: "amc001", 
    customerId: "cust001", 
    customerName: "TechSolutions Pvt Ltd", 
    model: "Kyocera ECOSYS M2040dn", 
    serialNumber: "VKG8401245", 
    location: "3rd Floor, Admin", 
    contractType: "AMC", 
    startDate: "2024-01-01", 
    endDate: "2025-01-01", 
    currentRent: 5000, 
    copyLimit: 20000, 
    lastMeterReading: 18500, 
    lastReadingDate: "2024-03-15" 
  },
  { 
    id: "machine002", 
    contractId: "amc002", 
    customerId: "cust002", 
    customerName: "Global Enterprises", 
    model: "Canon iR2625", 
    serialNumber: "CNX43215", 
    location: "Reception Area", 
    contractType: "Rental", 
    startDate: "2024-02-15", 
    endDate: "2025-02-15", 
    currentRent: 7500, 
    copyLimit: 30000, 
    lastMeterReading: 25600, 
    lastReadingDate: "2024-03-20" 
  },
];

// Mock contracts
const mockContracts: Record<string, AMCContract> = {
  "amc001": {
    id: "amc001",
    customerId: "cust001",
    customerName: "TechSolutions Pvt Ltd",
    machineModel: "Kyocera ECOSYS M2040dn",
    serialNumber: "VKG8401245",
    contractType: "AMC",
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    monthlyRent: 5000,
    gstPercent: 18,
    copyLimit: 20000,
    extraCopyCharge: 0.38,
    billingCycle: "Monthly",
    status: "Active"
  },
  "amc002": {
    id: "amc002",
    customerId: "cust002",
    customerName: "Global Enterprises",
    machineModel: "Canon iR2625",
    serialNumber: "CNX43215",
    contractType: "Rental",
    startDate: "2024-02-15",
    endDate: "2025-02-15",
    monthlyRent: 7500,
    gstPercent: 18,
    copyLimit: 30000,
    extraCopyCharge: 0.42,
    billingCycle: "Quarterly",
    status: "Active"
  }
};

interface AddMeterReadingDialogProps {
  onReadingAdded: (billing: any) => void;
}

const AddMeterReadingDialog = ({ onReadingAdded }: AddMeterReadingDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const monthOptions = getMonthOptions();
  const [selectedMachine, setSelectedMachine] = useState<AMCMachine | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      machineId: "",
      month: monthOptions[0]?.value || "",
      openingReading: 0,
      closingReading: 0,
    },
  });

  // Handle machine selection
  const handleMachineChange = (machineId: string) => {
    const machine = mockMachines.find(m => m.id === machineId);
    if (machine) {
      setSelectedMachine(machine);
      form.setValue("machineId", machine.id);
      form.setValue("openingReading", machine.lastMeterReading);
    }
  };

  // Validate that closing reading is greater than opening reading
  const validateReadings = (closingReading: number) => {
    const openingReading = form.getValues("openingReading");
    if (closingReading <= openingReading) {
      form.setError("closingReading", {
        type: "manual",
        message: "Closing reading must be greater than opening reading"
      });
      return false;
    }
    return true;
  };

  const onSubmit = (data: FormValues) => {
    // Validate readings
    if (!validateReadings(data.closingReading)) {
      return;
    }
    
    if (!selectedMachine) {
      toast.error("No machine selected");
      return;
    }
    
    const contract = mockContracts[selectedMachine.contractId];
    
    if (!contract) {
      toast.error("Contract not found for this machine");
      return;
    }
    
    // Calculate billing details
    const totalCopies = data.closingReading - data.openingReading;
    const freeCopies = contract.copyLimit;
    const extraCopies = Math.max(0, totalCopies - freeCopies);
    const extraCopyCharge = extraCopies * contract.extraCopyCharge;
    const gstPercent = contract.gstPercent;
    const gstAmount = extraCopyCharge * (gstPercent / 100);
    const rent = contract.monthlyRent;
    const rentGst = rent * (gstPercent / 100);
    const totalBill = rent + rentGst + extraCopyCharge + gstAmount;
    
    // Generate a unique ID for this billing
    const billId = `bill${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`;
    
    // Generate invoice number if needed
    const invoiceNo = extraCopies > 0 ? `INV/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${billId.substring(4)}` : "";
    
    // Create the billing record
    const newBilling = {
      id: billId,
      contractId: contract.id,
      machineId: selectedMachine.id,
      customerId: contract.customerId,
      customerName: contract.customerName,
      machineModel: contract.machineModel,
      serialNumber: contract.serialNumber,
      month: data.month,
      openingReading: data.openingReading,
      closingReading: data.closingReading,
      totalCopies,
      freeCopies,
      extraCopies,
      extraCopyRate: contract.extraCopyCharge,
      extraCopyCharge,
      gstPercent,
      gstAmount,
      rent,
      rentGst,
      totalBill,
      billDate: new Date().toISOString().split('T')[0],
      billStatus: "Generated" as const,
      invoiceNo,
    };
    
    // Add the billing record
    onReadingAdded(newBilling);
    
    // Show success message
    toast.success("Meter reading recorded and billing generated successfully!");
    
    // Close the dialog and reset the form
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black text-white hover:bg-black/90">
          Add Meter Reading
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Record Monthly Meter Reading</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="space-y-4">
              {/* Machine Selection */}
              <FormField
                control={form.control}
                name="machineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine</FormLabel>
                    <Select 
                      onValueChange={(value) => handleMachineChange(value)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a machine" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockMachines.map(machine => (
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

              {/* Month Selection */}
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {monthOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Opening Reading */}
              <FormField
                control={form.control}
                name="openingReading"
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

              {/* Closing Reading */}
              <FormField
                control={form.control}
                name="closingReading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Closing Reading</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={form.getValues("openingReading") + 1} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedMachine && (
              <div className="rounded-md bg-muted p-4 text-sm">
                <h4 className="font-medium mb-2">Machine Details</h4>
                <p><span className="font-medium">Customer:</span> {selectedMachine.customerName}</p>
                <p><span className="font-medium">Model:</span> {selectedMachine.model}</p>
                <p><span className="font-medium">Serial Number:</span> {selectedMachine.serialNumber}</p>
                <p><span className="font-medium">Contract Type:</span> {selectedMachine.contractType}</p>
                <p><span className="font-medium">Free Copy Limit:</span> {selectedMachine.copyLimit.toLocaleString()}</p>
                <p><span className="font-medium">Last Reading:</span> {selectedMachine.lastMeterReading.toLocaleString()} (on {selectedMachine.lastReadingDate})</p>
              </div>
            )}

            <DialogFooter>
              <Button type="submit">Save & Generate Bill</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMeterReadingDialog;
