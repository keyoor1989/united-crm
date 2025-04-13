
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
import { Skeleton } from "@/components/ui/skeleton";
import MachineForm from "./machines/MachineForm";
import MachinesList from "./machines/MachinesList";
import SalesFollowUpDialog from "./machines/SalesFollowUpDialog";
import { SalesFollowUpList } from "./machines/SalesFollowUpList";
import { Machine } from "./machines/types";
import { useCustomerForm } from "./CustomerFormContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CustomerMachinesProps {
  customerId?: string;
}

const CustomerMachines: React.FC<CustomerMachinesProps> = ({ customerId }) => {
  const [open, setOpen] = useState(false);
  const [isNewMachine, setIsNewMachine] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [followUps, setFollowUps] = useState([]);
  const [activeTab, setActiveTab] = useState("machines");

  // Get the customer context if we're in the form
  const { form } = useCustomerForm();
  const formCustomerId = form.getValues("id");
  
  // Use customer details hook
  const { customer, isLoading, error } = useCustomerDetails();

  const currentCustomer = customer || {
    id: formCustomerId || "",
    name: form.getValues("name") || "New Customer",
    phone: form.getValues("phone") || "",
    location: form.getValues("area") || "",
    status: "New",
    email: form.getValues("email") || "",
    lastContact: "Just now",
    machines: []
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[125px] w-full" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-[250px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading customer details</AlertTitle>
        <AlertDescription>
          There was an error loading the customer details. Please try again later or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  // Check if we have a valid customer (either from the database or from the form)
  if (!currentCustomer || (!currentCustomer.id && !formCustomerId)) {
    return (
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle>Customer information needed</AlertTitle>
        <AlertDescription>
          Please fill out the customer information in the "Customer Form" tab first.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSaveFollowUp = (newFollowUp: any) => {
    setFollowUps(prevFollowUps => [...prevFollowUps, newFollowUp]);
  };

  const handleScheduleFollowUp = (machine: Machine) => {
    setSelectedMachine(machine);
    setOpen(true);
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
              <h2 className="text-lg font-medium">{currentCustomer?.name}</h2>
              <p className="text-sm text-muted-foreground">
                {currentCustomer?.location} | {currentCustomer?.phone}
              </p>
              <Badge variant="secondary">{currentCustomer?.status}</Badge>
            </div>
            <Button onClick={() => setOpen(true)}>Schedule Follow-up</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="machines" className="data-[state=active]:bg-background">Machines</TabsTrigger>
          <TabsTrigger value="followups" className="data-[state=active]:bg-background">Follow-ups</TabsTrigger>
        </TabsList>
        <TabsContent value="machines">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium">Machines</h3>
            <Button onClick={() => setIsNewMachine(true)}>Add Machine</Button>
          </div>
          <MachineForm
            open={isNewMachine}
            setOpen={setIsNewMachine}
            customerId={currentCustomer?.id || ""}
          />
          <MachinesList 
            customerId={currentCustomer?.id || ""} 
            onScheduleFollowUp={handleScheduleFollowUp}
            onAddMachine={() => setIsNewMachine(true)}
          />
        </TabsContent>
        <TabsContent value="followups">
          <h3 className="text-xl font-medium mb-4">Follow-ups</h3>
          <SalesFollowUpList customerId={currentCustomer?.id || ""} />
        </TabsContent>
      </Tabs>

      <SalesFollowUpDialog
        open={open}
        setOpen={setOpen}
        customerId={currentCustomer?.id || ""}
        customerName={currentCustomer?.name || ""}
        location={currentCustomer?.location || ""}
        phone={currentCustomer?.phone || ""}
        onSave={handleSaveFollowUp}
      />
    </div>
  );
};

export default CustomerMachines;
