
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, FileText, Phone, Mail, MapPin, Wrench, Clock, ClipboardList, FileUp, Calendar } from "lucide-react";
import { CustomerType } from "@/types/customer";
import { toast } from "sonner";

interface CustomerLookupViewProps {
  customer: CustomerType;
}

const CustomerLookupView: React.FC<CustomerLookupViewProps> = ({ customer }) => {
  const handleCreateQuotation = () => {
    toast.info(`Feature coming soon: Create quotation for ${customer.name}`);
  };

  const handleAddFollowUp = () => {
    toast.info(`Feature coming soon: Add follow-up for ${customer.name}`);
  };

  const handleOpenCRM = () => {
    toast.info(`Feature coming soon: Open ${customer.name} in CRM`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Customer Found
        </Badge>
      </div>

      <Card className="p-4 border-l-4 border-l-blue-500">
        <div className="flex items-center mb-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-lg">{customer.name}</h3>
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              <Badge variant="outline" className={
                customer.status === "Active" ? "bg-green-50 text-green-700 border-green-200" :
                customer.status === "Prospect" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                customer.status === "Contract Renewal" ? "bg-orange-50 text-orange-700 border-orange-200" :
                customer.status === "Need Toner" ? "bg-purple-50 text-purple-700 border-purple-200" :
                "bg-red-50 text-red-700 border-red-200"
              }>
                {customer.status}
              </Badge>
              <span className="ml-2">Last Contact: {customer.lastContact}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{customer.phone}</span>
          </div>
          
          {customer.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{customer.email}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{customer.location}</span>
          </div>
        </div>

        {customer.machines.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Wrench className="h-4 w-4" /> Machines
            </h4>
            <div className="flex flex-wrap gap-2">
              {customer.machines.map((machine, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {machine}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Clock className="h-4 w-4" /> Recent Activity
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <span>Last service call: <span className="font-medium">3 weeks ago (Ravi Engineer)</span></span>
            </div>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <span>Last follow-up: <span className="font-medium">5 days ago</span></span>
            </div>
            <div className="flex items-center gap-2">
              <FileUp className="h-4 w-4 text-muted-foreground" />
              <span>Payment status: <span className="font-medium">No pending amounts</span></span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleCreateQuotation}
          >
            <FileText className="h-4 w-4" />
            Create Quotation
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleAddFollowUp}
          >
            <Calendar className="h-4 w-4" />
            Add Follow-up
          </Button>
          <Button 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleOpenCRM}
          >
            <FileText className="h-4 w-4" />
            Open in CRM
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CustomerLookupView;
