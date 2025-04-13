import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerDetails } from "@/hooks/useCustomerDetails";
import { Badge } from "@/components/ui/badge";
import MachineForm from "./machines/MachineForm";
import MachinesList from "./machines/MachinesList";
import SalesFollowUpDialog from "./machines/SalesFollowUpDialog";
import SalesFollowUpList from "./machines/SalesFollowUpList";

interface CustomerMachinesProps {
  customerId: string;
}

const CustomerMachines: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isNewMachine, setIsNewMachine] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [followUps, setFollowUps] = useState([]);

  const { customer, isLoading, error } = useCustomerDetails();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleSaveFollowUp = (newFollowUp: any) => {
    setFollowUps(prevFollowUps => [...prevFollowUps, newFollowUp]);
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
          <CardDescription>
            View and manage customer machines and follow-ups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">{customer?.name}</h2>
              <p className="text-sm text-muted-foreground">
                {customer?.location} | {customer?.phone}
              </p>
              <Badge variant="secondary">{customer?.status}</Badge>
            </div>
            <Button onClick={() => setOpen(true)}>Schedule Follow-up</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="machines" className="w-full mt-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="machines" className="data-[state=active]:bg-background">Machines</TabsTrigger>
          <TabsTrigger value="followups" className="data-[state=active]:bg-background">Follow-ups</TabsTrigger>
        </TabsList>
        <TabsContent value="machines" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium">Machines</h3>
            <Button onClick={() => setIsNewMachine(true)}>Add Machine</Button>
          </div>
          <MachineForm
            open={isNewMachine}
            setOpen={setIsNewMachine}
            customerId={customer?.id}
          />
          <MachinesList customerId={customer?.id} />
        </TabsContent>
        <TabsContent value="followups" className="mt-4">
          <h3 className="text-xl font-medium mb-4">Follow-ups</h3>
          <SalesFollowUpList customerId={customer?.id} />
        </TabsContent>
      </Tabs>

      <SalesFollowUpDialog
        open={open}
        setOpen={setOpen}
        customerId={customer?.id}
        customerName={customer?.name}
        location={customer?.location}
        phone={customer?.phone}
        onSave={handleSaveFollowUp}
      />
    </div>
  );
};

export default CustomerMachines;
