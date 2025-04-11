
import React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Printer, CalendarClock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Machine } from "./types";

interface FollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followUpMachine: Machine | null;
  followUpDate: Date | undefined;
  setFollowUpDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  followUpNotes: string;
  setFollowUpNotes: React.Dispatch<React.SetStateAction<string>>;
  onSaveFollowUp: () => void;
}

export const FollowUpDialog: React.FC<FollowUpDialogProps> = ({
  open,
  onOpenChange,
  followUpMachine,
  followUpDate,
  setFollowUpDate,
  followUpNotes,
  setFollowUpNotes,
  onSaveFollowUp,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Service Follow-up</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {followUpMachine && (
            <div className="flex items-center gap-2 mb-4">
              <Printer className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{followUpMachine.model}</p>
                <p className="text-xs text-muted-foreground">SN: {followUpMachine.serialNumber}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="followup-date">Follow-up Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !followUpDate && "text-muted-foreground"
                  )}
                >
                  <CalendarClock className="mr-2 h-4 w-4" />
                  {followUpDate ? format(followUpDate, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={followUpDate}
                  onSelect={setFollowUpDate}
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
              placeholder="Add details about this service follow-up"
              value={followUpNotes}
              onChange={(e) => setFollowUpNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button onClick={onSaveFollowUp}>Save Follow-up</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
