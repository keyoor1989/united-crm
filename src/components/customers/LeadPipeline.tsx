
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Phone, Mail, MessageSquare, UserPlus, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Customer = {
  id: string;
  name: string;
  contact: string;
  area: string;
  machineType: string;
  status: "New" | "Quoted" | "Follow-up" | "Converted" | "Lost";
  lastContact: Date;
};

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('customers')
          .select('id, name, phone, area, lead_status, last_contact, customer_machines(machine_name)')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching customers for pipeline:", error);
          toast({
            title: "Error",
            description: "Failed to load customer data",
            variant: "destructive",
          });
          return;
        }
        
        if (data) {
          const formattedCustomers: Customer[] = data.map(customer => ({
            id: customer.id,
            name: customer.name,
            contact: customer.phone,
            area: customer.area,
            machineType: customer.customer_machines && customer.customer_machines.length > 0 
              ? customer.customer_machines[0].machine_name 
              : "Unknown",
            status: customer.lead_status as Customer["status"],
            lastContact: new Date(customer.last_contact || new Date())
          }));
          
          setCustomers(formattedCustomers);
        }
      } catch (error) {
        console.error("Error in fetchCustomers for pipeline:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, [toast]);
  
  const filteredCustomers = selectedStage 
    ? customers.filter(customer => customer.status === selectedStage)
    : customers;
    
  const moveCustomer = async (customerId: string, direction: "forward" | "backward") => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    const currentStatusIndex = stages.indexOf(customer.status);
    let newStatus: Customer["status"];
    
    if (direction === "forward" && currentStatusIndex < stages.length - 1) {
      newStatus = stages[currentStatusIndex + 1] as Customer["status"];
    } else if (direction === "backward" && currentStatusIndex > 0) {
      newStatus = stages[currentStatusIndex - 1] as Customer["status"];
    } else {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('customers')
        .update({ lead_status: newStatus })
        .eq('id', customerId);
        
      if (error) {
        console.error("Error updating customer status:", error);
        toast({
          title: "Update Failed",
          description: "Could not update customer status",
          variant: "destructive",
        });
        return;
      }
      
      // Update local state
      setCustomers(customers.map(c => 
        c.id === customerId ? { ...c, status: newStatus } : c
      ));
      
      toast({
        title: "Status Updated",
        description: `${customer.name} moved to ${newStatus}`,
      });
      
    } catch (error) {
      console.error("Error in moveCustomer:", error);
    }
  };

  const handleContact = (type: "call" | "email" | "whatsapp", contact: string) => {
    switch (type) {
      case "call":
        window.location.href = `tel:${contact}`;
        break;
      case "email":
        // This would need an email field in the data
        toast({
          title: "Feature Unavailable",
          description: "Email functionality coming soon",
        });
        break;
      case "whatsapp":
        const cleanPhone = contact.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center animate-pulse">
          <div className="flex space-x-2">
            {stages.map((_, i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((stage) => (
            <Card key={stage} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
                  <div className="h-5 w-8 bg-gray-200 rounded-full"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="border rounded-md p-3 bg-white">
                    <div className="h-12 w-full bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 w-full bg-gray-200 rounded"></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
                  {customers.filter(c => c.status === stage).length}
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          title="Call"
                          onClick={() => handleContact("call", customer.contact)}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          title="Email"
                          onClick={() => handleContact("email", customer.contact)}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          title="WhatsApp"
                          onClick={() => handleContact("whatsapp", customer.contact)}
                        >
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
