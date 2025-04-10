
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Store,
  Edit,
  Trash2,
  History,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Vendor } from "@/types/inventory";

interface VendorTableProps {
  vendors: Vendor[];
  formatDate: (dateString: string) => string;
  onViewVendorDetails: (vendor: Vendor) => void;
  onEditVendor: (vendor: Vendor) => void;
  onDeleteClick: (vendorId: string) => void;
}

const VendorTable: React.FC<VendorTableProps> = ({
  vendors,
  formatDate,
  onViewVendorDetails,
  onEditVendor,
  onDeleteClick,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>GST Number</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Since</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vendors.map((vendor) => (
          <TableRow key={vendor.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                {vendor.name}
              </div>
            </TableCell>
            <TableCell>{vendor.gstNo || "-"}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-muted-foreground" />
                {vendor.phone}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-muted-foreground" />
                {vendor.email}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                {vendor.address}
              </div>
            </TableCell>
            <TableCell>{formatDate(vendor.createdAt)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onViewVendorDetails(vendor)}
                >
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onEditVendor(vendor)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onDeleteClick(vendor.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        
        {vendors.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              No vendors found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default VendorTable;
