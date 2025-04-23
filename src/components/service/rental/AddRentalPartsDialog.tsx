
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
import { useToast } from "@/hooks/use-toast";
import { useInventoryItems } from "@/hooks/inventory/useInventoryItems";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface AddRentalPartsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineData: any;
  onPartAdded: (partData: any) => void;
}

const AddRentalPartsDialog = ({
  open,
  onOpenChange,
  machineData,
  onPartAdded,
}: AddRentalPartsDialogProps) => {
  const { toast } = useToast();
  const { items: inventoryItems, isLoading } = useInventoryItems(null);
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentReading, setCurrentReading] = useState({
    a4: machineData?.last_a4_reading || 0,
    a3: machineData?.last_a3_reading || 0
  });

  const handleSubmit = () => {
    if (!selectedPart) {
      toast({
        title: "Error",
        description: "Please select a part first",
        variant: "destructive",
      });
      return;
    }

    const partData = {
      item_id: selectedPart.id,
      item_name: selectedPart.part_name,
      quantity: quantity,
      cost: selectedPart.purchase_price * quantity,
      readings: {
        a4: currentReading.a4,
        a3: currentReading.a3
      },
      date: new Date().toISOString(),
      machine_id: machineData.id,
      machine_model: machineData.model,
      machine_type: machineData.machine_type,
      serial_number: machineData.serial_number
    };

    onPartAdded(partData);
    onOpenChange(false);
    setSelectedPart(null);
    setQuantity(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add Parts Usage</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Current A4 Reading</Label>
              <Input 
                type="number" 
                value={currentReading.a4}
                onChange={(e) => setCurrentReading(prev => ({
                  ...prev,
                  a4: parseInt(e.target.value)
                }))}
              />
            </div>
            <div>
              <Label>Current A3 Reading</Label>
              <Input 
                type="number"
                value={currentReading.a3}
                onChange={(e) => setCurrentReading(prev => ({
                  ...prev,
                  a3: parseInt(e.target.value)
                }))}
              />
            </div>
          </div>

          <div>
            <Label>Select Part</Label>
            <div className="border rounded-md mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : inventoryItems?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">No parts available</TableCell>
                    </TableRow>
                  ) : (
                    inventoryItems?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.part_name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPart(item)}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {selectedPart && (
            <div className="space-y-2">
              <Label>Selected Part: {selectedPart.part_name}</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Total Cost</Label>
                  <Input
                    type="number"
                    value={(selectedPart.purchase_price * quantity).toFixed(2)}
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedPart}
          >
            Add Part
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRentalPartsDialog;
