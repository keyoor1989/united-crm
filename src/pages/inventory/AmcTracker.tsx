import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AMCMachine {
  id: string;
  contract_id: string;
  customer_id: string;
  customer_name: string;
  model: string;
  machine_type: string;
  serial_number: string;
  location: string;
  amc_start_date: string;
  amc_end_date: string;
  amc_type: string;
  amc_amount: number;
  gst_percentage: number;
  total_amount: number;
  remarks: string;
  created_at: string;
}

interface AMCBilling {
  id: string;
  contract_id: string;
  customer_id: string;
  customer_name: string;
  machine_id: string;
  billing_date: string;
  billing_amount: number;
  gst_percentage: number;
  total_amount: number;
  payment_date: string | null;
  payment_mode: string | null;
  payment_reference: string | null;
  remarks: string | null;
  created_at: string;
}

const AmcTracker: React.FC = () => {
  const { toast } = useToast();
  const [machines, setMachines] = useState<AMCMachine[]>([]);
  const [billingData, setBillingData] = useState<AMCBilling[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMachines, setFilteredMachines] = useState<AMCMachine[]>([]);
  const [isBillingDialogOpen, setIsBillingDialogOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [newBilling, setNewBilling] = useState<Omit<AMCBilling, 'id' | 'created_at'>>({
    contract_id: "",
    customer_id: "",
    customer_name: "",
    machine_id: "",
    billing_date: new Date().toISOString().split('T')[0],
    billing_amount: 0,
    gst_percentage: 0,
    total_amount: 0,
    payment_date: null,
    payment_mode: null,
    payment_reference: null,
    remarks: null,
  });
  const [paymentDate, setPaymentDate] = useState<Date | undefined>();

  useEffect(() => {
    const fetchMachines = async () => {
      setLoadingMachines(true);
      try {
        const { data, error } = await supabase
          .from('amc_machines')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching machines:", error);
          toast({
            title: "Error",
            description: "Failed to fetch machines. Please try again.",
            variant: "destructive",
          });
        } else {
          setMachines(data || []);
        }
      } finally {
        setLoadingMachines(false);
      }
    };

    const fetchBillingData = async () => {
      setLoadingBilling(true);
      try {
        const { data, error } = await supabase
          .from('amc_billing')
          .select('*')
          .order('billing_date', { ascending: false });

        if (error) {
          console.error("Error fetching billing data:", error);
          toast({
            title: "Error",
            description: "Failed to fetch billing data. Please try again.",
            variant: "destructive",
          });
        } else {
          setBillingData(data || []);
        }
      } finally {
        setLoadingBilling(false);
      }
    };

    fetchMachines();
    fetchBillingData();
  }, [toast]);

  useEffect(() => {
    const filtered = machines.filter(machine =>
      machine.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.serial_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMachines(filtered);
  }, [searchQuery, machines]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewBilling(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBillingDialogOpen = (contractId: string) => {
    setSelectedContractId(contractId);
    const selectedMachine = machines.find(machine => machine.contract_id === contractId);
    if (selectedMachine) {
      setNewBilling(prev => ({
        ...prev,
        contract_id: selectedMachine.contract_id,
        customer_id: selectedMachine.customer_id,
        customer_name: selectedMachine.customer_name,
        machine_id: selectedMachine.id,
      }));
    }
    setIsBillingDialogOpen(true);
  };

  const handleBillingDialogClose = () => {
    setIsBillingDialogOpen(false);
    setSelectedContractId(null);
    setNewBilling({
      contract_id: "",
      customer_id: "",
      customer_name: "",
      machine_id: "",
      billing_date: new Date().toISOString().split('T')[0],
      billing_amount: 0,
      gst_percentage: 0,
      total_amount: 0,
      payment_date: null,
      payment_mode: null,
      payment_reference: null,
      remarks: null,
    });
    setPaymentDate(undefined);
  };

  const calculateTotalAmount = () => {
    const billingAmount = parseFloat(newBilling.billing_amount.toString());
    const gstPercentage = parseFloat(newBilling.gst_percentage.toString());

    if (isNaN(billingAmount) || isNaN(gstPercentage)) {
      return 0;
    }

    const gstAmount = billingAmount * (gstPercentage / 100);
    return billingAmount + gstAmount;
  };

  const handleSubmitBilling = async () => {
    try {
      if (!selectedContractId) {
        toast({
          title: "Error",
          description: "Contract ID is required.",
          variant: "destructive",
        });
        return;
      }

      const billingAmount = parseFloat(newBilling.billing_amount.toString());
      const gstPercentage = parseFloat(newBilling.gst_percentage.toString());

      if (isNaN(billingAmount) || isNaN(gstPercentage) || billingAmount <= 0) {
        toast({
          title: "Error",
          description: "Billing amount and GST percentage must be valid numbers.",
          variant: "destructive",
        });
        return;
      }

      const totalAmount = calculateTotalAmount();

      const billingDataToInsert = {
        ...newBilling,
        billing_amount: billingAmount,
        gst_percentage: gstPercentage,
        total_amount: totalAmount,
        payment_date: paymentDate ? paymentDate.toISOString() : null,
      };

      const { error } = await supabase
        .from('amc_billing')
        .insert([billingDataToInsert]);

      if (error) {
        console.error("Error inserting billing data:", error);
        toast({
          title: "Error",
          description: "Failed to add billing. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Billing added successfully.",
        });
        handleBillingDialogClose();
        // Refresh billing data
        const { data } = await supabase
          .from('amc_billing')
          .select('*')
          .order('billing_date', { ascending: false });
        setBillingData(data || []);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>AMC Tracker | Inventory Management</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-medium">Track AMC Machines and Billing</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AMC Machines</CardTitle>
          <CardDescription>
            View and manage all AMC machines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              type="search"
              placeholder="Search by customer name, model, or serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract ID</TableHead>
                <TableHead>Machine ID</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>AMC Start Date</TableHead>
                <TableHead>AMC End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingMachines ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">Loading machines...</TableCell>
                </TableRow>
              ) : filteredMachines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">No machines found.</TableCell>
                </TableRow>
              ) : (
                filteredMachines.map((machine) => (
                  <TableRow key={machine.id}>
                    <TableCell className="font-medium">{machine.contract_id}</TableCell>
                    <TableCell className="text-center">{machine.id}</TableCell>
                    <TableCell className="whitespace-nowrap">{machine.customer_name}</TableCell>
                    <TableCell>{machine.model}</TableCell>
                    <TableCell>{machine.serial_number}</TableCell>
                    <TableCell>{new Date(machine.amc_start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(machine.amc_end_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleBillingDialogOpen(machine.contract_id)}>Add Billing</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Data</CardTitle>
          <CardDescription>
            View all billing data for AMC machines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract ID</TableHead>
                <TableHead>Machine ID</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Billing Date</TableHead>
                <TableHead>Billing Amount</TableHead>
                <TableHead>GST Percentage</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Payment Reference</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingBilling ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center">Loading billing data...</TableCell>
                </TableRow>
              ) : billingData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center">No billing data found.</TableCell>
                </TableRow>
              ) : (
                billingData.map((billing, index) => (
                  <TableRow key={billing.id}>
                    <TableCell key={`cell-${index}-0`} className="font-medium">{billing.contract_id}</TableCell>
                    <TableCell key={`cell-${index}-1`} className="text-center">
                      {billing.machine_id}
                    </TableCell>
                    <TableCell key={`cell-${index}-2`} className="whitespace-nowrap text-center">
                      {billing.customer_name}
                    </TableCell>
                    <TableCell key={`cell-${index}-3`} className="text-center">
                      {new Date(billing.billing_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell key={`cell-${index}-4`} className="text-center">
                      {billing.billing_amount}
                    </TableCell>
                    <TableCell key={`cell-${index}-5`} className="text-center">
                      {billing.gst_percentage}
                    </TableCell>
                    <TableCell key={`cell-${index}-6`} className="text-center">
                      {billing.total_amount}
                    </TableCell>
                    <TableCell key={`cell-${index}-7`} className="text-center">
                      {billing.payment_date ? new Date(billing.payment_date).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell key={`cell-${index}-8`} className="text-center">
                      {billing.payment_mode || "N/A"}
                    </TableCell>
                    <TableCell key={`cell-${index}-9`} className="text-center">
                      {billing.payment_reference || "N/A"}
                    </TableCell>
                    <TableCell key={`cell-${index}-10`} className="text-center">
                      {billing.remarks || "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isBillingDialogOpen} onOpenChange={handleBillingDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Billing</DialogTitle>
            <DialogDescription>
              Add billing data for the selected AMC machine.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billing_date">Billing Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !newBilling.billing_date && "text-muted-foreground"
                      )}
                    >
                      {newBilling.billing_date ? (
                        format(new Date(newBilling.billing_date), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(newBilling.billing_date)}
                      onSelect={(date) => {
                        if (date) {
                          setNewBilling(prev => ({
                            ...prev,
                            billing_date: date.toISOString().split('T')[0],
                          }));
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="billing_amount">Billing Amount</Label>
                <Input
                  type="number"
                  name="billing_amount"
                  id="billing_amount"
                  value={newBilling.billing_amount.toString()}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gst_percentage">GST Percentage</Label>
                <Input
                  type="number"
                  name="gst_percentage"
                  id="gst_percentage"
                  value={newBilling.gst_percentage.toString()}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="total_amount">Total Amount</Label>
                <Input
                  type="number"
                  id="total_amount"
                  value={calculateTotalAmount().toString()}
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment_date">Payment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !paymentDate && "text-muted-foreground"
                      )}
                    >
                      {paymentDate ? (
                        format(paymentDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={paymentDate}
                      onSelect={setPaymentDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="payment_mode">Payment Mode</Label>
                <Select
                  name="payment_mode"
                  onValueChange={(value) => setNewBilling(prev => ({ ...prev, payment_mode: value }))}
                  defaultValue={newBilling.payment_mode || undefined}
                >
                  <SelectTrigger id="payment_mode">
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Net Banking">Net Banking</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="payment_reference">Payment Reference</Label>
              <Input
                type="text"
                name="payment_reference"
                id="payment_reference"
                value={newBilling.payment_reference || ""}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                name="remarks"
                id="remarks"
                value={newBilling.remarks || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <Button type="button" onClick={handleSubmitBilling}>Add Billing</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AmcTracker;
