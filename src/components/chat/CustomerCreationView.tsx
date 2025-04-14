
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, FilePen, CalendarPlus, User, Phone, Mail, MapPin } from "lucide-react";
import { CustomerType } from "@/types/customer";
import { toast } from "sonner";

interface CustomerCreationViewProps {
  customer: CustomerType;
  isDuplicate?: boolean;
  duplicateCustomer?: CustomerType | null;
}

const CustomerCreationView: React.FC<CustomerCreationViewProps> = ({ 
  customer, 
  isDuplicate = false,
  duplicateCustomer = null 
}) => {
  const handleCreateQuotation = () => {
    toast.info(`Feature coming soon: Create quotation for ${customer.name}`);
  };

  const handleAddFollowup = () => {
    toast.info(`Feature coming soon: Add follow-up for ${customer.name}`);
  };

  const handleOpenCustomer = () => {
    toast.info(`Feature coming soon: Open customer profile for ${customer.name}`);
    // In a real app, this would navigate to the customer profile
    // window.location.href = `/customers/${customer.id}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {isDuplicate ? (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Existing Customer
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            New Customer Created
          </Badge>
        )}
      </div>

      <Card className="p-4 border-l-4 border-l-green-500">
        <div className="flex items-center mb-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-lg">{customer.name}</h3>
            <p className="text-muted-foreground text-sm">{isDuplicate ? "Found in database" : "New lead"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
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
          
          {customer.machines && customer.machines.length > 0 && (
            <div className="flex items-center gap-2 text-sm col-span-full">
              <span className="text-muted-foreground">Interested in:</span>
              <span>{customer.machines.join(", ")}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleCreateQuotation}
          >
            <FilePen className="h-4 w-4" />
            Create Quotation
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleAddFollowup}
          >
            <CalendarPlus className="h-4 w-4" />
            Add Follow-up
          </Button>
          <Button 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleOpenCustomer}
          >
            <User className="h-4 w-4" />
            Open Customer
          </Button>
        </div>
      </Card>

      {isDuplicate && duplicateCustomer && (
        <div className="text-sm text-muted-foreground">
          <p>This customer already exists in your database. The existing record has been shown above.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerCreationView;
