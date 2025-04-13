
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MachineFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  customerId: string;
  onSuccess?: () => void;
}

const MachineForm: React.FC<MachineFormProps> = ({ open, setOpen, customerId, onSuccess }) => {
  const { toast } = useToast();
  const [machineName, setMachineName] = useState('');
  const [machineType, setMachineType] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [installationDate, setInstallationDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!machineName) {
      toast({
        description: "Machine name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('customer_machines')
        .insert({
          customer_id: customerId,
          machine_name: machineName,
          machine_type: machineType || null,
          machine_serial: serialNumber || null,
          installation_date: installationDate || null,
          is_external_purchase: true
        });

      if (error) throw error;
      
      toast({
        description: "Machine added successfully"
      });
      
      // Reset form
      setMachineName('');
      setMachineType('');
      setSerialNumber('');
      setInstallationDate('');
      setOpen(false);
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error adding machine:', error);
      toast({
        description: `Failed to add machine: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Machine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="machine-name" className="text-right">
                Machine Name
              </Label>
              <Input
                id="machine-name"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="machine-type" className="text-right">
                Type
              </Label>
              <Input
                id="machine-type"
                value={machineType}
                onChange={(e) => setMachineType(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Printer, Scanner, etc."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serial-number" className="text-right">
                Serial Number
              </Label>
              <Input
                id="serial-number"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="installation-date" className="text-right">
                Install Date
              </Label>
              <Input
                id="installation-date"
                type="date"
                value={installationDate}
                onChange={(e) => setInstallationDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Machine'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MachineForm;
