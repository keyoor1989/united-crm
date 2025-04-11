
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { PieChart, Calendar, FileText, Download, Filter, ChevronDown } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import EntryFormDialog from "@/components/finance/EntryFormDialog";
import EntryTable from "@/components/finance/EntryTable";
import DateRangeFilter from "@/components/finance/DateRangeFilter";
import { Expense } from "@/types/finance";
import { expenseEntries, departments, paymentMethods, months } from "@/data/financeData";
import { exportToCsv, exportToPdf } from "@/utils/exportUtils";

import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Define expense types
const expenseTypes = [
  "Machine Purchase",
  "Spare Part Purchase",
  "Engineer Salary",
  "Rent & Utilities",
  "Travel / Fuel",
  "Courier / Logistics",
  "Miscellaneous"
];

// Define GST percentages
const gstPercentages = ["0", "5", "12", "18", "28"];

// Define branches
const branches = ["Indore", "Bhopal", "Jabalpur"];

// Form schema
const formSchema = z.object({
  expenseType: z.string().min(1, "Please select an expense type"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  gstPercentage: z.string().optional(),
  paidTo: z.string().min(1, "Please enter who the expense was paid to"),
  department: z.string().min(1, "Please select a department"),
  paymentMode: z.string().min(1, "Please select a payment mode"),
  date: z.date(),
  branch: z.string().min(1, "Please select a branch"),
  notes: z.string().optional(),
  bill: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const DepartmentExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(expenseEntries);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [filterDepartment, setFilterDepartment] = useState<string | undefined>(undefined);
  const [filterBranch, setFilterBranch] = useState<string | undefined>(undefined);
  const [filterPaymentMode, setFilterPaymentMode] = useState<string | undefined>(undefined);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expenseType: "",
      amount: 0,
      gstPercentage: "0",
      paidTo: "",
      department: "",
      paymentMode: "",
      date: new Date(),
      branch: "",
      notes: "",
      bill: undefined,
    },
  });

  const onSubmit = (data: FormValues) => {
    const gstAmount = data.gstPercentage 
      ? (data.amount * Number(data.gstPercentage) / 100) 
      : 0;
    
    const totalWithGst = data.amount + gstAmount;
    
    if (currentExpense) {
      // Update existing expense
      const updatedExpenses = expenses.map((expense) =>
        expense.id === currentExpense.id
          ? {
              ...expense,
              date: format(data.date, "yyyy-MM-dd"),
              category: data.expenseType,
              amount: data.amount,
              gstPercentage: data.gstPercentage ? Number(data.gstPercentage) : undefined,
              totalWithGst,
              vendor: data.paidTo,
              department: data.department,
              paymentMethod: data.paymentMode,
              branch: data.branch,
              notes: data.notes,
              billFile: data.bill,
            }
          : expense
      );
      setExpenses(updatedExpenses);
    } else {
      // Add new expense
      const newExpense: Expense = {
        id: uuidv4(),
        date: format(data.date, "yyyy-MM-dd"),
        department: data.department,
        category: data.expenseType,
        amount: data.amount,
        description: data.notes || "",
        vendor: data.paidTo,
        billNumber: "",
        paymentStatus: "Paid",
        paymentMethod: data.paymentMode,
        approvedBy: "Current User", // In a real app this would be the logged-in user
        gstPercentage: data.gstPercentage ? Number(data.gstPercentage) : undefined,
        totalWithGst,
        branch: data.branch,
        notes: data.notes,
        billFile: data.bill,
      };
      setExpenses([newExpense, ...expenses]);
    }
    
    // Close the form and reset it
    closeForm();
  };

  const openForm = (expense?: Expense) => {
    if (expense) {
      setCurrentExpense(expense);
      form.reset({
        expenseType: expense.category,
        amount: expense.amount,
        gstPercentage: expense.gstPercentage ? expense.gstPercentage.toString() : "0",
        paidTo: expense.vendor || "",
        department: expense.department,
        paymentMode: expense.paymentMethod || "",
        date: new Date(expense.date),
        branch: expense.branch || "",
        notes: expense.notes || "",
        bill: expense.billFile,
      });
    } else {
      setCurrentExpense(null);
      form.reset({
        expenseType: "",
        amount: 0,
        gstPercentage: "0",
        paidTo: "",
        department: "",
        paymentMode: "",
        date: new Date(),
        branch: "",
        notes: "",
        bill: undefined,
      });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setCurrentExpense(null);
  };

  const handleDelete = (expense: Expense) => {
    const updatedExpenses = expenses.filter((e) => e.id !== expense.id);
    setExpenses(updatedExpenses);
  };

  // Filter expenses based on selected filters
  const filteredExpenses = expenses.filter((expense) => {
    const matchesDateRange =
      (!startDate || new Date(expense.date) >= startDate) &&
      (!endDate || new Date(expense.date) <= endDate);
    
    const matchesDepartment = !filterDepartment || expense.department === filterDepartment;
    
    const matchesBranch = !filterBranch || expense.branch === filterBranch;
    
    const matchesPaymentMode = !filterPaymentMode || expense.paymentMethod === filterPaymentMode;
    
    return matchesDateRange && matchesDepartment && matchesBranch && matchesPaymentMode;
  });

  // Calculate total expenses
  const totalExpense = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Prepare data for department-wise pie chart
  const departmentData = departments.map((dept) => {
    const deptTotal = filteredExpenses
      .filter((expense) => expense.department === dept)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: dept,
      value: deptTotal,
    };
  }).filter(item => item.value > 0);

  // Prepare table columns
  const columns = [
    {
      key: "date",
      header: "Date",
      cell: (row: Expense) => format(new Date(row.date), "dd/MM/yyyy"),
    },
    {
      key: "category",
      header: "Type",
    },
    {
      key: "amount",
      header: "Amount",
      cell: (row: Expense) => 
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(row.amount),
    },
    {
      key: "vendor",
      header: "Paid To",
    },
    {
      key: "department",
      header: "Department",
    },
    {
      key: "branch",
      header: "Branch",
    },
    {
      key: "gstPercentage",
      header: "GST%",
      cell: (row: Expense) => row.gstPercentage ? `${row.gstPercentage}%` : "N/A",
    },
    {
      key: "totalWithGst",
      header: "Total",
      cell: (row: Expense) => 
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(row.totalWithGst || row.amount),
    },
    {
      key: "paymentMethod",
      header: "Mode",
    },
    {
      key: "notes",
      header: "Notes",
      cell: (row: Expense) => row.notes || "-",
    },
  ];

  const exportData = () => {
    exportToCsv(filteredExpenses, 'Department_Expenses');
  };

  const exportPdf = () => {
    exportToPdf(filteredExpenses, 'Department Expenses Report');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Department-wise Expenses</h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportData}>
                <FileText className="h-4 w-4 mr-2" />
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportPdf}>
                <FileText className="h-4 w-4 mr-2" />
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => openForm()}>Add Expense</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(totalExpense)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Department-wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {departmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => 
                        new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                        }).format(value)
                      } 
                    />
                  </RechartsChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No expense data to display
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />

            <div>
              <FormLabel>Department</FormLabel>
              <Select
                value={filterDepartment || ""}
                onValueChange={(value) => setFilterDepartment(value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <FormLabel>Branch</FormLabel>
              <Select
                value={filterBranch || ""}
                onValueChange={(value) => setFilterBranch(value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <FormLabel>Payment Mode</FormLabel>
              <Select
                value={filterPaymentMode || ""}
                onValueChange={(value) => setFilterPaymentMode(value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Modes</SelectItem>
                  {paymentMethods.map((mode) => (
                    <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <EntryTable
        columns={columns}
        data={filteredExpenses}
        onAdd={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        addButtonText="Add Expense"
      />

      <EntryFormDialog
        isOpen={isFormOpen}
        onClose={closeForm}
        title={currentExpense ? "Edit Expense" : "Add Expense"}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={form.formState.isSubmitting}
      >
        <Form {...form}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              control={form.control}
              name="expenseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select expense type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gstPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST %</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select GST percentage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {gstPercentages.map((percentage) => (
                        <SelectItem key={percentage} value={percentage}>
                          {percentage}%
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
              name="paidTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid To</FormLabel>
                  <FormControl>
                    <Input placeholder="Vendor or person name" {...field} />
                  </FormControl>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
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
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Mode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode}
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
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
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
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
              name="bill"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Bill (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
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
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Add any additional notes here" {...field} />
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

export default DepartmentExpenses;
