
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Phone,
  Mail,
  MessageSquare,
  MoreVertical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomerType } from "@/types/customer";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CustomerHistoryDialog } from "./CustomerHistoryDialog";

interface CustomerTableProps {
  customers: CustomerType[];
  onCall: (phone: string) => void;
  onEmail: (email: string) => void;
  onWhatsApp: (phone: string) => void;
  isLoading?: boolean;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onCall,
  onEmail,
  onWhatsApp,
  isLoading = false,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [historyCustomer, setHistoryCustomer] = React.useState<CustomerType | null>(null);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Active": return "bg-green-500";
      case "Contract Renewal": return "bg-amber-500";
      case "Need Toner": return "bg-blue-500";
      case "Inactive": return "bg-gray-500";
      case "Prospect": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const handleViewDetails = (customerId: string) => {
    navigate(`/customer/${customerId}`);
  };

  const handleMachineHistory = (customerId: string) => {
    navigate(`/customer/${customerId}`);
    toast({
      title: "Machine History",
      description: "Navigating to customer machine history",
    });
  };

  const handleCreateQuotation = (customer: CustomerType) => {
    const queryParams = new URLSearchParams({
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
      customerLocation: customer.location || ''
    }).toString();
    
    navigate(`/quotation-form?${queryParams}`);
    
    toast({
      title: "Create Quotation",
      description: `Creating a new quotation for ${customer.name}`,
    });
  };

  const handleScheduleService = (customerId: string) => {
    navigate(`/service-call-form?customerId=${customerId}`);
    toast({
      title: "Schedule Service",
      description: "Scheduling a service call for this customer",
    });
  };

  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    toast({
      title: "Delete Customer",
      description: `Are you sure you want to delete ${customerName}? This action cannot be undone.`,
      variant: "destructive",
      action: (
        <Button 
          variant="outline" 
          className="bg-white" 
          onClick={() => confirmDeleteCustomer(customerId, customerName)}
        >
          Confirm
        </Button>
      )
    });
  };

  const confirmDeleteCustomer = async (customerId: string, customerName: string) => {
    try {
      const { data: machines, error: machinesError } = await supabase
        .from('customer_machines')
        .select('id')
        .eq('customer_id', customerId);
        
      if (machinesError) throw machinesError;
      
      if (machines && machines.length > 0) {
        const { error: machineDeleteError } = await supabase
          .from('customer_machines')
          .delete()
          .eq('customer_id', customerId);
          
        if (machineDeleteError) throw machineDeleteError;
      }
      
      const { data: serviceCalls, error: serviceCallsError } = await supabase
        .from('service_calls')
        .select('id')
        .eq('customer_id', customerId);
        
      if (serviceCallsError) throw serviceCallsError;
      
      if (serviceCalls && serviceCalls.length > 0) {
        const { error: serviceCallDeleteError } = await supabase
          .from('service_calls')
          .delete()
          .eq('customer_id', customerId);
          
        if (serviceCallDeleteError) throw serviceCallDeleteError;
      }
      
      const { error: notesError } = await supabase
        .from('customer_notes')
        .delete()
        .eq('customer_id', customerId);
      
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);
        
      if (deleteError) throw deleteError;
      
      toast({
        title: "Customer Deleted",
        description: `${customerName} has been successfully deleted.`,
      });
      
      window.location.reload();
      
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error Deleting Customer",
        description: error.message || "Failed to delete customer. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex space-x-4 items-center mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="ml-auto space-x-2 flex">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No customers found. Add your first customer!</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="w-[250px] font-bold text-gray-800">Customer Name</TableHead>
            <TableHead className="w-[200px] font-bold text-gray-800">Contact</TableHead>
            <TableHead className="w-[120px] font-bold text-gray-800">Location</TableHead>
            <TableHead className="w-[180px] font-bold text-gray-800">Machines</TableHead>
            <TableHead className="w-[120px] font-bold text-gray-800">Status</TableHead>
            <TableHead className="w-[120px] text-right font-bold text-gray-800">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer, index) => (
            <TableRow 
              key={customer.id}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <TableCell className="font-medium border-l-4 border-brand-500">
                <div className="text-base font-semibold text-gray-900">{customer.name}</div>
                <div className="text-xs text-muted-foreground">Last contact: {customer.lastContact}</div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-gray-700">
                    <Phone className="h-3 w-3 flex-shrink-0 text-gray-500" />
                    <span className="truncate">{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-700">
                    <Mail className="h-3 w-3 flex-shrink-0 text-gray-500" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-gray-700">{customer.location}</TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {customer.machines.length > 1 ? (
                    <>
                      <Badge variant="outline" className="bg-slate-50">{customer.machines[0]}</Badge>
                      <Badge variant="outline" className="bg-slate-50">+{customer.machines.length - 1} more</Badge>
                    </>
                  ) : customer.machines.length === 1 ? (
                    <Badge variant="outline" className="bg-slate-50">{customer.machines[0]}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">No machines</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Call"
                    onClick={() => onCall(customer.phone)}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Email"
                    onClick={() => onEmail(customer.email)}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="WhatsApp"
                    onClick={() => onWhatsApp(customer.phone)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white z-50">
                      <DropdownMenuItem onClick={() => handleViewDetails(customer.id)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setHistoryCustomer(customer);
                        setHistoryDialogOpen(true);
                      }}>
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMachineHistory(customer.id)}>
                        Machine History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreateQuotation(customer)}>
                        Create Quotation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleScheduleService(customer.id)}>
                        Schedule Service
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                      >
                        Delete Customer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CustomerHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        customer={historyCustomer}
      />
    </>
  );
};

export default CustomerTable;
