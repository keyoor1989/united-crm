
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ActionBarProps {
  onNewTransfer: () => void;
}

const ActionBar = ({ onNewTransfer }: ActionBarProps) => (
  <div className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-2xl font-bold">Warehouse Transfers</h1>
      <p className="text-muted-foreground">Transfer stock from one warehouse to another (Live)</p>
    </div>
    <Button className="gap-1" onClick={onNewTransfer}>
      <Plus className="h-4 w-4" />
      New Warehouse Transfer
    </Button>
  </div>
);

export default ActionBar;
