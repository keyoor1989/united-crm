
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Phone, Mail, MessageSquare, UserPlus, Filter } from "lucide-react";

type Customer = {
  id: number;
  name: string;
  contact: string;
  area: string;
  machineType: string;
  status: "New" | "Quoted" | "Follow-up" | "Converted" | "Lost";
  lastContact: Date;
};

const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "Govt. Medical College",
    contact: "9876543210",
    area: "Indore",
    machineType: "Kyocera 2554ci",
    status: "New",
    lastContact: new Date(2025, 3, 5),
  },
  {
    id: 2,
    name: "Sunrise Hospital",
    contact: "8765432109",
    area: "Bhopal",
    machineType: "Xerox 7845",
    status: "Quoted",
    lastContact: new Date(2025, 3, 7),
  },
  {
    id: 3,
    name: "Rajesh Enterprises",
    contact: "7654321098",
    area: "Jabalpur",
    machineType: "Ricoh MP2014",
    status: "Follow-up",
    lastContact: new Date(2025, 3, 8),
  },
  {
    id: 4,
    name: "City Hospital",
    contact: "6543210987",
    area: "Indore",
    machineType: "Kyocera 2040",
    status: "Converted",
    lastContact: new Date(2025, 3, 1),
  },
  {
    id: 5,
    name: "ABC School",
    contact: "9512348760",
    area: "Bhopal",
    machineType: "HP LaserJet",
    status: "Lost",
    lastContact: new Date(2025, 2, 28),
  },
  {
    id: 6,
    name: "Global Solutions",
    contact: "8876543210",
    area: "Indore",
    machineType: "Canon IR2525",
    status: "New",
    lastContact: new Date(2025, 3, 9),
  },
  {
    id: 7,
    name: "Prime Industries",
    contact: "7712345678",
    area: "Jabalpur",
    machineType: "Kyocera 2554ci",
    status: "Follow-up",
    lastContact: new Date(2025, 3, 6),
  },
];

const stages = ["New", "Quoted", "Follow-up", "Converted", "Lost"];

const getStatusColor = (status: string) => {
  switch (status) {
    case "New":
      return "bg-blue-500";
    case "Quoted":
      return "bg-amber-500";
    case "Follow-up":
      return "bg-purple-500";
    case "Converted":
      return "bg-green-500";
    case "Lost":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getInitials = (name: string) => {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
};

export default function LeadPipeline() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  
  const filteredCustomers = selectedStage 
    ? mockCustomers.filter(customer => customer.status === selectedStage)
    : mockCustomers;
    
  const moveCustomer = (customerId: number, direction: "forward" | "backward") => {
    // This would typically update the customer status in a real implementation
    console.log(`Moving customer ${customerId} ${direction}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {stages.map((stage) => (
            <Button
              key={stage}
              variant={selectedStage === stage ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setSelectedStage(selectedStage === stage ? null : stage)}
            >
              <Badge className={`${getStatusColor(stage)} h-2 w-2 rounded-full p-0`} />
              {stage}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Filter className="h-4 w-4" />
          More Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => (
          <Card key={stage} className={`${selectedStage && selectedStage !== stage ? 'opacity-50' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <Badge className={getStatusColor(stage)}>
                  {stage}
                </Badge>
                <Badge variant="outline">
                  {mockCustomers.filter(c => c.status === stage).length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredCustomers
                .filter(customer => customer.status === stage)
                .map(customer => (
                  <div key={customer.id} className="border rounded-md p-3 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-xs">
                            {getInitials(customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-sm font-medium">{customer.name}</h4>
                          <p className="text-xs text-muted-foreground">{customer.area}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-3">
                      <p>Last contact: {customer.lastContact.toLocaleDateString()}</p>
                      <p className="mt-1">Machine: {customer.machineType}</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" title="Call">
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" title="Email">
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" title="WhatsApp">
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex space-x-1">
                        {stage !== "New" && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => moveCustomer(customer.id, "backward")}
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                        )}
                        {stage !== "Converted" && stage !== "Lost" && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => moveCustomer(customer.id, "forward")}
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              
              {stage === "New" && (
                <Button variant="outline" className="w-full text-muted-foreground justify-start">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Lead
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
