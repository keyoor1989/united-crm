
import React from "react";
import { CustomerType } from "@/types/customer";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin } from "lucide-react";

interface SearchResultItemProps {
  customer: CustomerType;
  formatPhoneNumber: (phone: string) => string;
  onSelectCustomer: (customer: CustomerType) => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  customer,
  formatPhoneNumber,
  onSelectCustomer
}) => {
  return (
    <div 
      key={customer.id}
      className="p-2 hover:bg-muted rounded-md cursor-pointer"
      onClick={() => onSelectCustomer(customer)}
    >
      <div className="flex items-start gap-2">
        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary">{formatPhoneNumber(customer.phone)}</span>
            {customer.machines.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {customer.machines.length} machines
              </Badge>
            )}
          </div>
          <div className="text-sm">{customer.name}</div>
          <div className="text-xs text-muted-foreground">
            {customer.location && 
              <span className="flex items-center gap-1 inline-block mr-2">
                <MapPin className="h-3 w-3" /> {customer.location}
              </span>
            }
            {customer.email && 
              <span className="text-xs text-muted-foreground">
                {customer.email}
              </span>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultItem;
