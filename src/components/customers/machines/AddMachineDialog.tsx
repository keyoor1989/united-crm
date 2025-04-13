
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MachineFormData } from "./types";

interface AddMachineDialogProps {
  open: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMachine: () => void;
  newMachineData: MachineFormData;
  setNewMachineData: React.Dispatch<React.SetStateAction<MachineFormData>>;
}

export const AddMachineDialog: React.FC<AddMachineDialogProps> = ({
  open,
  isLoading,
  onOpenChange,
  onAddMachine,
  newMachineData,
  setNewMachineData,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Machine (Including External Purchases)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="machine-model">Machine Model*</Label>
            <Input
              id="machine-model"
              placeholder="Enter machine model (e.g., Kyocera Taskalfa 2554ci)"
              value={newMachineData.model}
              onChange={(e) => setNewMachineData({...newMachineData, model: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="machine-serial">Serial Number (Optional)</Label>
            <Input
              id="machine-serial"
              placeholder="Enter serial number if available"
              value={newMachineData.serialNumber || ""}
              onChange={(e) => setNewMachineData({...newMachineData, serialNumber: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">
              Optional - Leave blank for machines not purchased from us
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="machine-type">Machine Type*</Label>
            <Select
              value={newMachineData.machineType}
              onValueChange={(value) => setNewMachineData({...newMachineData, machineType: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select machine type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="copier">Copier</SelectItem>
                <SelectItem value="printer">Printer</SelectItem>
                <SelectItem value="scanner">Scanner</SelectItem>
                <SelectItem value="mfp">MFP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="installation-date">Installation Date (Optional)</Label>
            <Input
              id="installation-date"
              type="date"
              value={newMachineData.installationDate || ""}
              onChange={(e) => setNewMachineData({...newMachineData, installationDate: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">
              Optional - Leave blank for machines not installed by us
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="machine-status">Status*</Label>
            <Select
              value={newMachineData.status}
              onValueChange={(value: any) => setNewMachineData({...newMachineData, status: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance Required</SelectItem>
                <SelectItem value="replacement-due">Replacement Due</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button 
            onClick={onAddMachine} 
            disabled={isLoading || !newMachineData.model || !newMachineData.machineType}
          >
            {isLoading ? "Adding..." : "Add Machine"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add default export for the component
export default AddMachineDialog;
