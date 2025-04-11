
import React from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { InventoryItem } from "@/types/inventory";

// Define the form schema
const formSchema = z.object({
  contractId: z.string().min(1, "Contract is required"),
  machineId: z.string().min(1, "Machine is required"),
  engineerId: z.string().min(1, "Engineer is required"),
  date: z.date(),
  itemId: z.string().min(1, "Item is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Mock data for the demo
const mockContracts = [
  { id: "amc001", customerName: "TechSolutions Pvt Ltd", machineModel: "Kyocera ECOSYS M2040dn", serialNumber: "VKG8401245" },
  { id: "amc002", customerName: "Global Enterprises", machineModel: "Canon iR2625", serialNumber: "CNX43215" },
  { id: "amc003", customerName: "Sunrise Hospital", machineModel: "Kyocera TASKalfa 2553ci", serialNumber: "VLK9245678" },
];

const mockMachines = [
  { id: "machine001", contractId: "amc001", customerName: "TechSolutions Pvt Ltd", model: "Kyocera ECOSYS M2040dn", serialNumber: "VKG8401245" },
  { id: "machine002", contractId: "amc002", customerName: "Global Enterprises", model: "Canon iR2625", serialNumber: "CNX43215" },
  { id: "machine003", contractId: "amc003", customerName: "Sunrise Hospital", model: "Kyocera TASKalfa 2553ci", serialNumber: "VLK9245678" },
];

const mockEngineers = [
  { id: "eng001", name: "Rajesh Kumar" },
  { id: "eng002", name: "Amit Singh" },
  { id: "eng003", name: "Priya Sharma" },
];

const mockItems: InventoryItem[] = [
  { 
    id: "item001", 
    modelId: "model001", 
    brandId: "brand001", 
    name: "TK-1170 Toner", 
    type: "Toner", 
    minQuantity: 5, 
    currentQuantity: 12, 
    lastPurchasePrice: 2500, 
    lastVendor: "XYZ Supplies",
    barcode: "TK1170001",
    createdAt: "2024-01-15"
  },
  { 
    id: "item002", 
    modelId: "model002", 
    brandId: "brand002", 
    name: "NPG-59 Toner", 
    type: "Toner", 
    minQuantity: 3, 
    currentQuantity: 8, 
    lastPurchasePrice: 3200, 
    lastVendor: "ABC Traders",
    barcode: "NPG59001",
    createdAt: "2024-01-20"
  },
  { 
    id: "item003", 
    modelId: "model003", 
    brandId: "brand001", 
    name: "DK-1150 Drum", 
    type: "Drum", 
    minQuantity: 2, 
    currentQuantity: 5, 
    lastPurchasePrice: 5800, 
    lastVendor: "XYZ Supplies",
    barcode: "DK1150001",
    createdAt: "2024-02-05"
  },
];

interface AddConsumableUsageDialogProps {
  onUsageAdded: (usage: any) => void;
}

const AddConsumableUsageDialog = ({ onUsageAdded }: AddConsumableUsageDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [selectedContractId, setSelectedContractId] = React.useState("");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractId: "",
      machineId: "",
      engineerId: "",
      date: new Date(),
      itemId: "",
      quantity: 1,
      remarks: "",
    },
  });

  // Filter machines based on selected contract
  const filteredMachines = mockMachines.filter(
    machine => selectedContractId ? machine.contractId === selectedContractId : true
  );

  // Handle contract selection
  const handleContractChange = (contractId: string) => {
    setSelectedContractId(contractId);
    form.setValue("contractId", contractId);
    form.setValue("machineId", ""); // Reset machine selection
  };

  const onSubmit = (data: FormValues) => {
    // Find the selected contract, machine, engineer, and item
    const contract = mockContracts.find(c => c.id === data.contractId);
    const machine = mockMachines.find(m => m.id === data.machineId);
    const engineer = mockEngineers.find(e => e.id === data.engineerId);
    const item = mockItems.find(i => i.id === data.itemId);
    
    if (!contract || !machine || !engineer || !item) {
      toast.error("Invalid selection. Please check your inputs.");
      return;
    }
    
    // Generate an ID for the new usage record
    const newUsage = {
      id: `usage${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
      contractId: data.contractId,
      machineId: data.machineId,
      customerId: machine.contractId.replace('amc', 'cust'),
      customerName: machine.customerName,
      machineModel: machine.model,
      serialNumber: machine.serialNumber,
      engineerId: data.engineerId,
      engineerName: engineer.name,
      date: format(data.date, "yyyy-MM-dd"),
      itemId: data.itemId,
      itemName: item.name,
      quantity: data.quantity,
      cost: item.lastPurchasePrice * data.quantity,
      remarks: data.remarks || "Regular replacement",
    };
    
    onUsageAdded(newUsage);
    toast.success("Consumable usage recorded successfully!");
    
    // Simulate inventory deduction
    toast.info(`${data.quantity} ${item.name} deducted from inventory`);
    
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black text-white hover:bg-black/90">
          Add Consumable Usage
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Consumable Usage</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contract Selection */}
              <FormField
                control={form.control}
                name="contractId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract</FormLabel>
                    <Select 
                      onValueChange={(value) => handleContractChange(value)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a contract" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockContracts.map(contract => (
                          <SelectItem key={contract.id} value={contract.id}>
                            {contract.customerName} - {contract.machineModel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Machine Selection */}
              <FormField
                control={form.control}
                name="machineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedContractId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedContractId ? "Select a machine" : "Select a contract first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredMachines.map(machine => (
                          <SelectItem key={machine.id} value={machine.id}>
                            {machine.model} - {machine.serialNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Engineer Selection */}
              <FormField
                control={form.control}
                name="engineerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engineer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an engineer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockEngineers.map(engineer => (
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

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Item Selection */}
              <FormField
                control={form.control}
                name="itemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consumable</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a consumable" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockItems.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - ₹{item.lastPurchasePrice} (Stock: {item.currentQuantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity */}
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

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional information about this consumable usage"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save Usage</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddConsumableUsageDialog;
