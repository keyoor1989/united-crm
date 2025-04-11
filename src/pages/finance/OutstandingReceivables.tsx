
import React, { useState } from "react";
import { format, addDays, isAfter, isBefore } from "date-fns";
import { 
  User, 
  CalendarIcon, 
  DollarSign, 
  Building, 
  PieChart, 
  AlertCircle, 
  Check,
  MessageSquare,
  FileText,
  Download
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import DateRangeFilter from "@/components/finance/DateRangeFilter";
import EntryFormDialog from "@/components/finance/EntryFormDialog";
import { receivableEntries, departments } from "@/data/financeData";
import { Receivable } from "@/types/finance";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { exportToCsv, exportToPdf } from "@/utils/exportUtils";
import { cn } from "@/lib/utils";

// Define form schema for validation
const formSchema = z.object({
  customer: z.string().min(2, { message: "Customer name is required" }),
  invoiceNumber: z.string().min(1, { message: "Invoice number is required" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  amountPaid: z.coerce.number().min(0, { message: "Amount paid must be positive or zero" }),
  dueDate: z.date({ required_error: "Due date is required" }),
  paymentMode: z.string().optional(),
  department: z.string(),
  branch: z.string(),
  notes: z.string().optional(),
  contactPerson: z.string().optional(),
  contactNumber: z.string().optional(),
  priority: z.enum(["High", "Medium", "Low"]),
});

type FormValues = z.infer<typeof formSchema>;

const OutstandingReceivables = () => {
  const [receivables, setReceivables] = useState<Receivable[]>(receivableEntries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState<string>("");
  const [filterBranch, setFilterBranch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 30));
  const { toast } = useToast();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer: "",
      invoiceNumber: "",
      amount: 0,
      amountPaid: 0,
      paymentMode: "Bank Transfer",
      department: "Sales",
      branch: "Indore",
      notes: "",
      contactPerson: "",
      contactNumber: "",
      priority: "Medium",
    },
  });

  // Calculate balance based on entered amounts
  const watchAmount = form.watch("amount");
  const watchAmountPaid = form.watch("amountPaid");
  const balance = (watchAmount || 0) - (watchAmountPaid || 0);

  // Calculate dashboard metrics
  const totalOutstanding = receivables
    .filter(r => r.status !== "Cleared")
    .reduce((sum, item) => sum + item.balance, 0);
    
  const overdueThisMonth = receivables
    .filter(r => r.status === "Overdue")
    .reduce((sum, item) => sum + item.balance, 0);
    
  // Get top 5 customers by outstanding amount
  const topCustomers = [...receivables]
    .filter(r => r.status !== "Cleared")
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    
    // Calculate balance and determine status
    const balance = data.amount - data.amountPaid;
    const today = new Date();
    let status: 'Overdue' | 'Due Soon' | 'Due' | 'Cleared' = 'Due';
    
    if (balance <= 0) {
      status = 'Cleared';
    } else if (isBefore(data.dueDate, today)) {
      status = 'Overdue';
    } else if (isBefore(data.dueDate, addDays(today, 7))) {
      status = 'Due Soon';
    }
    
    // Create new receivable entry
    const newReceivable: Receivable = {
      id: uuidv4(),
      invoiceNumber: data.invoiceNumber,
      customer: data.customer,
      date: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(data.dueDate, "yyyy-MM-dd"),
      amount: data.amount,
      amountPaid: data.amountPaid,
      balance,
      status,
      notes: data.notes,
      contactPerson: data.contactPerson,
      contactNumber: data.contactNumber,
      priority: data.priority,
      paymentMode: data.paymentMode,
      department: data.department,
      branch: data.branch,
    };
    
    // Add to list and close dialog
    setReceivables((prev) => [newReceivable, ...prev]);
    form.reset();
    setIsDialogOpen(false);
    setIsSubmitting(false);
    
    toast({
      title: "Receivable Added",
      description: `Successfully added receivable for ${data.customer}`,
    });
  };

  // Mark an entry as paid
  const markAsPaid = (id: string) => {
    setReceivables((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            amountPaid: item.amount,
            balance: 0,
            status: "Cleared" as const,
          };
        }
        return item;
      })
    );
    
    toast({
      title: "Payment Recorded",
      description: "Receivable has been marked as paid",
    });
  };

  // Send a payment reminder (placeholder)
  const sendReminder = (id: string) => {
    const receivable = receivables.find(r => r.id === id);
    
    toast({
      title: "Reminder Sent",
      description: `Payment reminder sent to ${receivable?.customer}`,
    });
  };

  // Generate receipt (placeholder)
  const generateReceipt = (id: string) => {
    toast({
      title: "Receipt Generated",
      description: "Receipt has been generated and is ready to download",
    });
  };

  // Apply filters to the receivables list
  const filteredReceivables = receivables.filter((receivable) => {
    const receivableDate = new Date(receivable.dueDate);
    const filterDateMatch = 
      (isAfter(receivableDate, startDate) || format(receivableDate, "yyyy-MM-dd") === format(startDate, "yyyy-MM-dd")) && 
      (isBefore(receivableDate, endDate) || format(receivableDate, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd"));
    
    const departmentMatch = !filterDepartment || receivable.department === filterDepartment;
    const branchMatch = !filterBranch || receivable.branch === filterBranch;
    const statusMatch = !filterStatus || receivable.status === filterStatus;
    
    return filterDateMatch && departmentMatch && branchMatch && statusMatch;
  });

  // Export to CSV
  const handleExportCsv = () => {
    exportToCsv(filteredReceivables, "outstanding_receivables");
    toast({
      title: "Export Complete",
      description: "Data has been exported to CSV",
    });
  };

  // Export to PDF
  const handleExportPdf = () => {
    exportToPdf(filteredReceivables, "Outstanding Receivables");
    toast({
      title: "Export Complete",
      description: "Data has been exported to PDF",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Outstanding Receivables</h1>
        <Button onClick={() => setIsDialogOpen(true)}>Add New Receivable</Button>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOutstanding.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{overdueThisMonth.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Pending Payments</CardTitle>
          </CardHeader>
          <CardContent className="max-h-40 overflow-auto">
            <ul className="space-y-1">
              {topCustomers.map((customer) => (
                <li key={customer.id} className="text-sm flex justify-between">
                  <span className="font-medium">{customer.customer}</span>
                  <span>₹{customer.balance.toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg p-4 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Due Date Range</label>
            <DateRangeFilter 
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Department</label>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Branch</label>
            <Select value={filterBranch} onValueChange={setFilterBranch}>
              <SelectTrigger>
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Branches</SelectItem>
                <SelectItem value="Indore">Indore</SelectItem>
                <SelectItem value="Bhopal">Bhopal</SelectItem>
                <SelectItem value="Jabalpur">Jabalpur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="Due">Due</SelectItem>
                <SelectItem value="Due Soon">Due Soon</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Cleared">Cleared</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" onClick={handleExportCsv} className="flex items-center gap-2">
          <Download size={16} />
          Export CSV
        </Button>
        <Button variant="outline" onClick={handleExportPdf} className="flex items-center gap-2">
          <FileText size={16} />
          Export PDF
        </Button>
      </div>

      {/* Receivables Table */}
      <div className="bg-card rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Due Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Invoice No.</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReceivables.length > 0 ? (
              filteredReceivables.map((receivable) => (
                <TableRow key={receivable.id}>
                  <TableCell>{new Date(receivable.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{receivable.customer}</TableCell>
                  <TableCell>{receivable.invoiceNumber}</TableCell>
                  <TableCell>{receivable.department || "Sales"}</TableCell>
                  <TableCell>₹{receivable.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>₹{receivable.amountPaid.toLocaleString('en-IN')}</TableCell>
                  <TableCell>₹{receivable.balance.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        receivable.status === "Overdue"
                          ? "destructive"
                          : receivable.status === "Due Soon"
                          ? "warning"
                          : receivable.status === "Cleared"
                          ? "success"
                          : "secondary"
                      }
                    >
                      {receivable.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {receivable.status !== "Cleared" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => markAsPaid(receivable.id)}
                            className="h-8 w-8 p-0"
                            title="Mark as Paid"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => sendReminder(receivable.id)}
                            className="h-8 w-8 p-0"
                            title="Send Reminder"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => generateReceipt(receivable.id)}
                        className="h-8 w-8 p-0"
                        title="Generate Receipt"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No receivables match the current filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Receivable Dialog */}
      <EntryFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Add New Receivable"
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
      >
        <Form {...form}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer / Dealer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice / Quotation Reference No.</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter invoice number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Invoice Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter total amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountPaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Received</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter amount received"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Pending Amount</FormLabel>
              <Input
                type="number"
                value={balance}
                disabled
                className="bg-muted"
              />
            </FormItem>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
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
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Mode (Expected)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Sales">Machine</SelectItem>
                      <SelectItem value="Spare Sales">Spare</SelectItem>
                      <SelectItem value="Rental">Rental</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Indore">Indore</SelectItem>
                      <SelectItem value="Bhopal">Bhopal</SelectItem>
                      <SelectItem value="Jabalpur">Jabalpur</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact person name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter any additional notes"
                    className="min-h-20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </EntryFormDialog>
    </div>
  );
};

export default OutstandingReceivables;
