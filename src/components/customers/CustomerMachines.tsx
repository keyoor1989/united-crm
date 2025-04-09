
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Printer, CalendarDays, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

type Machine = {
  id: number;
  model: string;
  serialNumber: string;
  installationDate: string;
  status: "active" | "maintenance" | "replacement-due";
  lastService: string;
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
    serialNumber: "RMP982321",
    installationDate: "2023-08-22",
    status: "maintenance",
    lastService: "2025-02-05",
  },
];

export default function CustomerMachines() {
  const [machines] = useState<Machine[]>(mockMachines);

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
    </Card>
  );
}
