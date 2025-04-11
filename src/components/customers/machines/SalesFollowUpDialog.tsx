
import React from "react";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SalesFollowUpFormData } from "./types";

interface SalesFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newSalesFollowUp: SalesFollowUpFormData;
  setNewSalesFollowUp: React.Dispatch<React.SetStateAction<SalesFollowUpFormData>>;
  onAddSalesFollowUp: () => void;
}

export const SalesFollowUpDialog: React.FC<SalesFollowUpDialogProps> = ({
  open,
  onOpenChange,
  newSalesFollowUp,
  setNewSalesFollowUp,
  onAddSalesFollowUp,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Sales Follow-up</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Customer Name</Label>
            <Input
              id="customer-name"
              placeholder="Enter customer name"
              value={newSalesFollowUp.customerName || ''}
              onChange={(e) => setNewSalesFollowUp({...newSalesFollowUp, customerName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="followup-type">Follow-up Type</Label>
            <Select
              value={newSalesFollowUp.type}
              onValueChange={(value) => setNewSalesFollowUp({...newSalesFollowUp, type: value as any})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select follow-up type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quotation">Quotation</SelectItem>
                <SelectItem value="demo">Demo</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="closure">Closure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="followup-date">Follow-up Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !newSalesFollowUp.date && "text-muted-foreground"
                  )}
                >
                  <CalendarClock className="mr-2 h-4 w-4" />
                  {newSalesFollowUp.date ? format(newSalesFollowUp.date, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newSalesFollowUp.date}
                  onSelect={(date) => setNewSalesFollowUp({...newSalesFollowUp, date})}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="followup-notes">Notes</Label>
            <Textarea
              id="followup-notes"
              placeholder="Add details about this sales follow-up"
              value={newSalesFollowUp.notes || ''}
              onChange={(e) => setNewSalesFollowUp({...newSalesFollowUp, notes: e.target.value})}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button onClick={onAddSalesFollowUp}>Save Follow-up</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
