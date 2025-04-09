
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

interface CustomerTableProps {
  customers: CustomerType[];
  onCall: (phone: string) => void;
  onEmail: (email: string) => void;
  onWhatsApp: (phone: string) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onCall,
  onEmail,
  onWhatsApp,
}) => {
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Customer Name</TableHead>
          <TableHead className="w-[200px]">Contact</TableHead>
          <TableHead className="w-[120px]">Location</TableHead>
          <TableHead className="w-[180px]">Machines</TableHead>
          <TableHead className="w-[120px]">Status</TableHead>
          <TableHead className="w-[120px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              No customers found matching your filters.
            </TableCell>
          </TableRow>
        ) : (
          customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">
                <div className="text-base">{customer.name}</div>
                <div className="text-xs text-muted-foreground">Last contact: {customer.lastContact}</div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{customer.location}</TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {customer.machines.length > 1 ? (
                    <>
                      <Badge variant="outline" className="bg-slate-50">{customer.machines[0]}</Badge>
                      <Badge variant="outline" className="bg-slate-50">+{customer.machines.length - 1} more</Badge>
                    </>
                  ) : (
                    <Badge variant="outline" className="bg-slate-50">{customer.machines[0]}</Badge>
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
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Machine History</DropdownMenuItem>
                      <DropdownMenuItem>Create Quotation</DropdownMenuItem>
                      <DropdownMenuItem>Schedule Service</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        Delete Customer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default CustomerTable;
