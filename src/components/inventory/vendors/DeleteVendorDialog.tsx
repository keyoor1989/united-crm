
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

interface DeleteVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleDeleteVendor: () => void;
}

const DeleteVendorDialog: React.FC<DeleteVendorDialogProps> = ({
  open,
  onOpenChange,
  handleDeleteVendor,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Vendor</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this vendor? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteVendor}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteVendorDialog;
