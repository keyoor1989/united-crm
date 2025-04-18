
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { EngineerItem } from "@/types/service";

interface AddPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engineerId: string;
  engineerName: string;
  engineerItems: EngineerItem[];
  onPartAdded: (part: any) => void;
  onClose?: () => void; // Add optional onClose prop
  onSave?: (part: any) => void; // Add optional onSave prop
  serviceCall?: any; // Add optional serviceCall prop
}

const AddPartDialog = ({
  open,
  onOpenChange,
  engineerId,
  engineerName,
  engineerItems,
  onPartAdded,
  onClose,
  onSave,
  serviceCall
}: AddPartDialogProps) => {
  const { toast } = useToast();
  const [selectedPart, setSelectedPart] = useState<{
    id: string;
    name: string;
    modelNumber: string | null;
    modelBrand: string | null;
    quantity: number;
    price: number;
  } | null>(null);

  const handlePartSelect = (engineerItem: EngineerItem) => {
    setSelectedPart({
      id: engineerItem.id,
      name: engineerItem.item_name,
      modelNumber: engineerItem.modelNumber,
      modelBrand: engineerItem.modelBrand,
      quantity: 1,
      price: 0
    });
  };

  const handleAddPart = () => {
    if (!selectedPart) {
      toast({
        title: "Error",
        description: "Please select a part to add.",
        variant: "destructive",
      });
      return;
    }

    // Handle both onPartAdded and onSave callbacks
    if (onSave) {
      onSave(selectedPart);
    } else {
      onPartAdded(selectedPart);
    }
    
    toast({
      title: "Part Added",
      description: `${selectedPart.name} added to service call.`,
    });
    
    // Handle dialog closing
    if (onClose) {
      onClose();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add Part to Service Call</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
            <Label htmlFor="engineer">Engineer:</Label>
            <Input id="engineer" value={engineerName} readOnly />
          </div>

          <Label>Select Part:</Label>
          <ScrollArea className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Model Number</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {engineerItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell>{item.modelNumber || "N/A"}</TableCell>
                    <TableCell>{item.modelBrand || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => handlePartSelect(item)}>
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          {selectedPart && (
            <div className="space-y-2">
              <Label>Selected Part:</Label>
              <div className="p-4 border rounded-md">
                <p className="font-medium">{selectedPart.name}</p>
                <p className="text-sm text-muted-foreground">
                  Model: {selectedPart.modelNumber || "N/A"}, Brand: {selectedPart.modelBrand || "N/A"}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onClose ? onClose() : onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleAddPart} disabled={!selectedPart}>
            Add Part
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPartDialog;
