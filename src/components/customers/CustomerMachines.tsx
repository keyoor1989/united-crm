
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Printer, CalendarDays, Settings, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Machine = {
  id: number;
  model: string;
  serialNumber: string;
  installationDate: string;
  status: "active" | "maintenance" | "replacement-due";
  lastService: string;
  followUp?: {
    date: Date;
    notes: string;
  };
};

const mockMachines: Machine[] = [
  {
    id: 1,
    model: "Kyocera 2554ci",
    serialNumber: "KYC5587621",
    installationDate: "2024-12-15",
    status: "active",
    lastService: "2025-03-10",
  },
  {
    id: 2,
    model: "Ricoh MP2014",
    serialNumber: "RMP982321",
    installationDate: "2023-08-22",
    status: "maintenance",
    lastService: "2025-02-05",
    followUp: {
      date: new Date(2025, 3, 16), // April 16, 2025
      notes: "Check if maintenance was completed, discuss upgrade options"
    }
  },
];

export default function CustomerMachines() {
  const [machines, setMachines] = useState<Machine[]>(mockMachines);
  const [followUpMachine, setFollowUpMachine] = useState<Machine | null>(null);
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined);
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "maintenance":
        return <Badge className="bg-amber-500">Maintenance Required</Badge>;
      case "replacement-due":
        return <Badge className="bg-red-500">Replacement Due</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const handleScheduleFollowUp = (machine: Machine) => {
    setFollowUpMachine(machine);
    setFollowUpDate(machine.followUp?.date);
    setFollowUpNotes(machine.followUp?.notes || "");
    setFollowUpDialogOpen(true);
  };

  const saveFollowUp = () => {
    if (!followUpMachine || !followUpDate) {
      toast.error("Please select a follow-up date");
      return;
    }

    const updatedMachines = machines.map(machine => {
      if (machine.id === followUpMachine.id) {
        return {
          ...machine,
          followUp: {
            date: followUpDate,
            notes: followUpNotes
          }
        };
      }
      return machine;
    });

    setMachines(updatedMachines);
    setFollowUpDialogOpen(false);
    toast.success(`Follow-up scheduled for ${format(followUpDate, "PPP")}`);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md">Customer Machines</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Machine</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Machine</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-center text-muted-foreground">
                Machine form would go here
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {machines.length > 0 ? (
          <div className="space-y-3">
            {machines.map((machine) => (
              <div key={machine.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 items-center">
                    <Printer className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{machine.model}</h4>
                      <p className="text-xs text-muted-foreground">
                        SN: {machine.serialNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(machine.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Service History</DropdownMenuItem>
                        <DropdownMenuItem>Log Service Call</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleScheduleFollowUp(machine)}>
                          Schedule Follow-up
                        </DropdownMenuItem>
                        <DropdownMenuItem>Schedule Maintenance</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-3 text-xs">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3 text-muted-foreground" />
                    <span>Installed: {new Date(machine.installationDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="h-3 w-3 text-muted-foreground" />
                    <span>Last Service: {new Date(machine.lastService).toLocaleDateString()}</span>
                  </div>
                  {machine.followUp && (
                    <div className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3 text-blue-500" />
                      <span className="text-blue-600 font-medium">Follow-up: {format(machine.followUp.date, "PPP")}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 border rounded-md border-dashed">
            <Printer className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No machines added yet</p>
          </div>
        )}
      </CardContent>

      <Dialog open={followUpDialogOpen} onOpenChange={setFollowUpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Follow-up</DialogTitle>
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
                placeholder="Add details about this follow-up"
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setFollowUpDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={saveFollowUp}>Save Follow-up</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
