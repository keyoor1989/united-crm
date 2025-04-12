
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import WarehouseForm, { WarehouseFormValues } from "./WarehouseForm";
import { Warehouse } from "@/types/inventory";

interface WarehouseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingWarehouse: Warehouse | null;
  onSubmit: (values: WarehouseFormValues) => void;
  isSubmitting: boolean;
}

const WarehouseFormDialog = ({
  open,
  onOpenChange,
  editingWarehouse,
  onSubmit,
  isSubmitting,
}: WarehouseFormDialogProps) => {
  // Convert editing warehouse to form values
  const defaultValues = editingWarehouse
    ? {
        name: editingWarehouse.name,
        code: editingWarehouse.code,
        location: editingWarehouse.location,
        address: editingWarehouse.address,
        contactPerson: editingWarehouse.contactPerson,
        contactPhone: editingWarehouse.contactPhone,
        isActive: editingWarehouse.isActive,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingWarehouse ? "Edit Warehouse" : "Add New Warehouse"}</DialogTitle>
          <DialogDescription>
            {editingWarehouse 
              ? "Update the warehouse details below." 
              : "Enter the warehouse details below to add a new storage location."}
          </DialogDescription>
        </DialogHeader>

        <WarehouseForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default WarehouseFormDialog;
