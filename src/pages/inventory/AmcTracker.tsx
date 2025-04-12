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
import { AMCMachine, AMCBilling, AMCProfitReport } from "@/types/inventory";

interface DbAMCMachine {
  id: string;
  contract_id: string;
  customer_id: string;
  customer_name: string;
  model: string;
  machine_type: string;
  serial_number: string;
  location: string;
  department?: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  current_rent: number;
  copy_limit_a4: number;
  copy_limit_a3: number;
  last_a4_reading: number;
  last_a3_reading: number;
  last_reading_date?: string;
  created_at?: string;
}

interface DbAMCBilling {
  id: string;
  contract_id: string;
  machine_id: string;
  customer_id: string;
  customer_name: string;
  machine_model: string;
  machine_type: string;
  serial_number: string;
  department?: string;
  billing_month: string;
  a4_opening_reading: number;
  a4_closing_reading: number;
  a4_total_copies: number;
  a4_free_copies: number;
  a4_extra_copies: number;
  a4_extra_copy_rate: number;
  a4_extra_copy_charge: number;
  a3_opening_reading: number;
  a3_closing_reading: number;
  a3_total_copies: number;
  a3_free_copies: number;
  a3_extra_copies: number;
  a3_extra_copy_rate: number;
  a3_extra_copy_charge: number;
  gst_percent: number;
  gst_amount: number;
  rent: number;
  rent_gst: number;
  total_bill: number;
  bill_date: string;
  bill_status: string;
  invoice_no?: string;
  created_at: string;
}

interface DbAMCConsumableUsage {
  id: string;
  contract_id: string;
  machine_id: string;
  customer_id: string;
  customer_name: string;
  machine_model: string;
  machine_type: string;
  serial_number: string;
  engineer_id?: string;
  engineer_name?: string;
  date: string;
  item_id?: string;
  item_name: string;
  quantity: number;
  cost: number;
  inventory_deducted?: boolean;
  department?: string;
  remarks?: string;
  created_at?: string;
}

interface DbAMCProfitReport {
  id: string;
  contract_id: string;
  machine_id: string;
  customer_id: string;
  customer_name: string;
  machine_model: string;
  machine_type: string;
  serial_number: string;
  department?: string;
  month: string;
  rent_received: number;
  extra_copy_income: number;
  total_income: number;
  consumables_cost: number;
  engineer_visit_cost: number;
  travel_expense: number;
  food_expense: number;
  other_expense: number;
  total_expense: number;
  profit: number;
  profit_margin: number;
  created_at?: string;
}

const convertToAMCMachine = (dbMachine: DbAMCMachine): AMCMachine => {
  return {
    id: dbMachine.id,
    contract_id: dbMachine.contract_id,
    customer_id: dbMachine.customer_id,
    customer_name: dbMachine.customer_name,
    model: dbMachine.model,
    machine_type: dbMachine.machine_type,
    serial_number: dbMachine.serial_number,
    location: dbMachine.location,
    department: dbMachine.department,
    contract_type: dbMachine.contract_type,
    start_date: dbMachine.start_date,
    end_date: dbMachine.end_date,
    current_rent: dbMachine.current_rent,
    copy_limit_a4: dbMachine.copy_limit_a4,
    copy_limit_a3: dbMachine.copy_limit_a3,
    last_a4_reading: dbMachine.last_a4_reading,
    last_a3_reading: dbMachine.last_a3_reading,
    last_reading_date: dbMachine.last_reading_date,
    created_at: dbMachine.created_at
  };
};

const convertToAMCBilling = (dbBilling: DbAMCBilling): AMCBilling => {
  return {
    id: dbBilling.id,
    contract_id: dbBilling.contract_id,
    machine_id: dbBilling.machine_id,
    customer_id: dbBilling.customer_id,
    customer_name: dbBilling.customer_name,
    machine_model: dbBilling.machine_model,
    machine_type: dbBilling.machine_type,
    serial_number: dbBilling.serial_number,
    department: dbBilling.department,
    billing_month: dbBilling.billing_month,
    a4_opening_reading: dbBilling.a4_opening_reading,
    a4_closing_reading: dbBilling.a4_closing_reading,
    a4_total_copies: dbBilling.a4_total_copies,
    a4_free_copies: dbBilling.a4_free_copies,
    a4_extra_copies: dbBilling.a4_extra_copies,
    a4_extra_copy_rate: dbBilling.a4_extra_copy_rate,
    a4_extra_copy_charge: dbBilling.a4_extra_copy_charge,
    a3_opening_reading: dbBilling.a3_opening_reading,
    a3_closing_reading: dbBilling.a3_closing_reading,
    a3_total_copies: dbBilling.a3_total_copies,
    a3_free_copies: dbBilling.a3_free_copies,
    a3_extra_copies: dbBilling.a3_extra_copies,
    a3_extra_copy_rate: dbBilling.a3_extra_copy_rate,
    a3_extra_copy_charge: dbBilling.a3_extra_copy_charge,
    gst_percent: dbBilling.gst_percent,
    gst_amount: dbBilling.gst_amount,
    rent: dbBilling.rent,
    rent_gst: dbBilling.rent_gst,
    total_bill: dbBilling.total_bill,
    bill_date: dbBilling.bill_date,
    bill_status: dbBilling.bill_status,
    invoice_no: dbBilling.invoice_no,
    created_at: dbBilling.created_at
  };
};

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
    contract_id: "",
    customer_id: "",
    customer_name: "",
    machine_id: "",
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
          const amcMachines = (data || []).map(convertToAMCMachine);
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
          const amcBillings = (data || []).map(convertToAMCBilling);
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

      const selectedMachine = machines.find(m => m.contract_id === selectedContractId);
      
      if (!selectedMachine) {
        toast({
          title: "Error",
          description: "Machine not found.",
          variant: "destructive",
        });
        return;
      }
      
      const billingDataToInsert = {
        contract_id: newBilling.contract_id,
        machine_id: newBilling.machine_id,
        customer_id: newBilling.customer_id,
        customer_name: newBilling.customer_name,
        machine_model: selectedMachine.model,
        machine_type: selectedMachine.machine_type,
        serial_number: selectedMachine.serial_number,
        billing_month: newBilling.billing_date,
        department: selectedMachine.department,
        a4_opening_reading: 0,
        a4_closing_reading: 0,
        a4_total_copies: 0,
        a4_free_copies: selectedMachine.copy_limit_a4,
        a4_extra_copies: 0,
        a4_extra_copy_rate: 0,
        a4_extra_copy_charge: 0,
        a3_opening_reading: 0,
        a3_closing_reading: 0,
        a3_total_copies: 0,
        a3_free_copies: selectedMachine.copy_limit_a3,
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
          const amcBillings = data.map(convertToAMCBilling);
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
                    <TableCell className="font-medium">{machine.contract_id}</TableCell>
                    <TableCell className="text-center">{machine.id}</TableCell>
                    <TableCell className="whitespace-nowrap">{machine.customer_name}</TableCell>
                    <TableCell>{machine.model}</TableCell>
                    <TableCell>{machine.serial_number}</TableCell>
                    <TableCell>{new Date(machine.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(machine.end_date).toLocaleDateString()}</TableCell>
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
                      {new Date(billing.billing_month).toLocaleDateString()}
                    </TableCell>
                    <TableCell key={`cell-${index}-4`} className="text-center">
                      {billing.rent}
                    </TableCell>
                    <TableCell key={`cell-${index}-5`} className="text-center">
                      {billing.gst_percent}
                    </TableCell>
                    <TableCell key={`cell-${index}-6`} className="text-center">
                      {billing.total_bill}
                    </TableCell>
                    <TableCell key={`cell-${index}-7`} className="text-center">
                      {billing.bill_date ? new Date(billing.bill_date).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell key={`cell-${index}-8`} className="text-center">
                      {billing.bill_status || "N/A"}
                    </TableCell>
                    <TableCell key={`cell-${index}-9`} className="text-center">
                      {billing.invoice_no || "N/A"}
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
