
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Vendor } from "@/types/inventory";

interface VendorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVendor: Vendor | null;
  formData: {
    id: string;
    name: string;
    gstNo: string;
    phone: string;
    email: string;
    address: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveVendor: () => void;
}

const VendorFormDialog: React.FC<VendorFormDialogProps> = ({
  open,
  onOpenChange,
  selectedVendor,
  formData,
  handleInputChange,
  handleSaveVendor,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{selectedVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
          <DialogDescription>
            {selectedVendor ? 
              "Update vendor details below." : 
              "Enter the vendor details to add them to your directory."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="name" className="text-right">
              Vendor Name*
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter vendor name"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="gstNo" className="text-right">
              GST Number
            </Label>
            <Input
              id="gstNo"
              name="gstNo"
              value={formData.gstNo}
              onChange={handleInputChange}
              placeholder="Enter GST number (optional)"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="phone" className="text-right">
              Phone Number*
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="email" className="text-right">
              Email Address*
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="address" className="text-right">
              Address*
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter complete address"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveVendor}>
            {selectedVendor ? "Update Vendor" : "Add Vendor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VendorFormDialog;
