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
import { AMCMachine, AMCBilling, DbAMCMachine, DbAMCBilling, dbAdapter } from "@/types/inventory";

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
  const [newBilling, setNewBilling] = useState({
    contractId: "",
    customerId: "",
    customerName: "",
    machineId: "",
    billing_date: new Date().toISOString().split('T')[0],
    billing_amount: 0,
    gst_percentage: 0,
    total_amount: 0,
    payment_date: null as string | null,
    payment_mode: null as string | null,
    payment_reference: null as string | null,
    remarks: null as string | null,
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
          const amcMachines = (data || []).map(machine => dbAdapter.adaptAMCMachine(machine as DbAMCMachine));
          setMachines(amcMachines);
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
          .order('billing_month', { ascending: false });

        if (error) {
          console.error("Error fetching billing data:", error);
          toast({
            title: "Error",
            description: "Failed to fetch billing data. Please try again.",
            variant: "destructive",
          });
        } else {
          const amcBillings = (data || []).map(billing => dbAdapter.adaptAMCBilling(billing as DbAMCBilling));
          setBillingData(amcBillings);
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
      machine.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      machine.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
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
    const selectedMachine = machines.find(machine => machine.contractId === contractId);
    if (selectedMachine) {
      setNewBilling(prev => ({
        ...prev,
        contractId: selectedMachine.contractId,
        customerId: selectedMachine.customerId,
        customerName: selectedMachine.customerName,
        machineId: selectedMachine.id,
      }));
    }
    setIsBillingDialogOpen(true);
  };

  const handleBillingDialogClose = () => {
    setIsBillingDialogOpen(false);
    setSelectedContractId(null);
    setNewBilling({
      contractId: "",
      customerId: "",
      customerName: "",
      machineId: "",
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

      const selectedMachine = machines.find(m => m.contractId === selectedContractId);
      
      if (!selectedMachine) {
        toast({
          title: "Error",
          description: "Machine not found.",
          variant: "destructive",
        });
        return;
      }
      
      const billingDataToInsert = {
        contract_id: newBilling.contractId,
        machine_id: newBilling.machineId,
        customer_id: newBilling.customerId,
        customer_name: newBilling.customerName,
        machine_model: selectedMachine.model,
        machine_type: selectedMachine.machineType,
        serial_number: selectedMachine.serialNumber,
        billing_month: newBilling.billing_date,
        department: selectedMachine.department,
        a4_opening_reading: 0,
        a4_closing_reading: 0,
        a4_total_copies: 0,
        a4_free_copies: selectedMachine.copyLimitA4,
        a4_extra_copies: 0,
        a4_extra_copy_rate: 0,
        a4_extra_copy_charge: 0,
        a3_opening_reading: 0,
        a3_closing_reading: 0,
        a3_total_copies: 0,
        a3_free_copies: selectedMachine.copyLimitA3,
        a3_extra_copies: 0,
        a3_extra_copy_rate: 0,
        a3_extra_copy_charge: 0,
        rent: billingAmount,
        gst_percent: gstPercentage,
        gst_amount: totalAmount - billingAmount,
        rent_gst: totalAmount - billingAmount,
        total_bill: totalAmount,
        bill_date: newBilling.billing_date,
        bill_status: "Generated",
        payment_date: paymentDate ? paymentDate.toISOString() : null,
        payment_mode: newBilling.payment_mode,
        payment_reference: newBilling.payment_reference,
        remarks: newBilling.remarks
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
        const { data } = await supabase
          .from('amc_billing')
          .select('*')
          .order('billing_month', { ascending: false });
        
        if (data) {
          const amcBillings = data.map(billing => dbAdapter.adaptAMCBilling(billing as DbAMCBilling));
          setBillingData(amcBillings);
        }
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
                    <TableCell className="font-medium">{machine.contractId}</TableCell>
                    <TableCell className="text-center">{machine.id}</TableCell>
                    <TableCell className="whitespace-nowrap">{machine.customerName}</TableCell>
                    <TableCell>{machine.model}</TableCell>
                    <TableCell>{machine.serialNumber}</TableCell>
                    <TableCell>{new Date(machine.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(machine.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleBillingDialogOpen(machine.contractId)}>Add Billing</Button>
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
                    <TableCell key={`cell-${index}-0`} className="font-medium">{billing.contractId}</TableCell>
                    <TableCell key={`cell-${index}-1`} className="text-center">
                      {billing.machineId}
                    </TableCell>
                    <TableCell key={`cell-${index}-2`} className="whitespace-nowrap text-center">
                      {billing.customerName}
                    </TableCell>
                    <TableCell key={`cell-${index}-3`} className="text-center">
                      {new Date(billing.billingMonth).toLocaleDateString()}
                    </TableCell>
                    <TableCell key={`cell-${index}-4`} className="text-center">
                      {billing.rent}
                    </TableCell>
                    <TableCell key={`cell-${index}-5`} className="text-center">
                      {billing.gstPercent}
                    </TableCell>
                    <TableCell key={`cell-${index}-6`} className="text-center">
                      {billing.totalBill}
                    </TableCell>
                    <TableCell key={`cell-${index}-7`} className="text-center">
                      {billing.billDate ? new Date(billing.billDate).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell key={`cell-${index}-8`} className="text-center">
                      {billing.billStatus || "N/A"}
                    </TableCell>
                    <TableCell key={`cell-${index}-9`} className="text-center">
                      {billing.invoiceNo || "N/A"}
                    </TableCell>
                    <TableCell key={`cell-${index}-10`} className="text-center">
                      N/A
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
