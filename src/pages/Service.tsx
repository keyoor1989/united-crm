import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ServiceCallCard } from "@/components/service/ServiceCallCard";
import { EngineerCard } from "@/components/service/EngineerCard";
import ServiceCallDetail from "@/components/service/ServiceCallDetail";
import { ServiceCall, Engineer } from "@/types/service";
import { mockServiceCalls, mockEngineers } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const Service = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>(mockServiceCalls);
  const [engineers, setEngineers] = useState<Engineer[]>(mockEngineers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceCall, setSelectedServiceCall] = useState<ServiceCall | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  const filterCalls = (status: string) => {
    if (status === "all") {
      return serviceCalls.filter(call => 
        call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return serviceCalls.filter(call => 
      call.status.toLowerCase() === status.toLowerCase() && 
      (call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       call.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
       call.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };
  
  const pendingCalls = filterCalls("pending");
  const inProgressCalls = filterCalls("in progress");
  const completedCalls = filterCalls("completed");
  const allCalls = filterCalls("all");
  
  const handleShowDetails = (serviceCall: ServiceCall) => {
    setSelectedServiceCall(serviceCall);
    setShowDetailDialog(true);
  };
  
  const handleAssignEngineer = (serviceCallId: string, engineerId: string) => {
    const updatedCalls = serviceCalls.map(call => {
      if (call.id === serviceCallId) {
        const assignedEngineer = engineers.find(e => e.id === engineerId);
        return {
          ...call,
          engineerId,
          engineerName: assignedEngineer?.name || "",
          status: "Pending"
        };
      }
      return call;
    });
    
    const updatedEngineers = engineers.map(eng => {
      if (eng.id === engineerId) {
        const serviceCall = serviceCalls.find(call => call.id === serviceCallId);
        return {
          ...eng,
          status: "On Call",
          currentJob: `Service Call #${serviceCallId}`,
          currentLocation: serviceCall?.location || eng.location
        };
      }
      return eng;
    });
    
    setServiceCalls(updatedCalls);
    setEngineers(updatedEngineers);
    
    toast({
      title: "Engineer Assigned",
      description: "The service call has been assigned to the engineer",
    });
  };
  
  const handleReassignCall = (serviceCallId: string) => {
    toast({
      title: "Reassignment",
      description: "Engineer reassignment feature coming soon",
    });
  };
  
  const handleEngineerCardClick = (engineerId: string) => {
    navigate(`/engineer/${engineerId}`);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Service Management</h1>
            <p className="text-muted-foreground">
              Track and manage service calls and engineer activities
            </p>
          </div>
          <Link to="/service-call-form">
            <Button className="gap-1 bg-brand-500 hover:bg-brand-600">
              <CalendarCheck className="h-4 w-4" />
              Create Service Call
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by customer, serial number or location..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => {
              setSearchTerm("");
              toast({
                title: "Refreshed",
                description: "Service calls have been refreshed",
              });
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="pending">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="pending">
                Pending
                <Badge className="ml-1 bg-amber-500">{pendingCalls.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="inProgress">
                In Progress
                <Badge className="ml-1 bg-blue-500">{inProgressCalls.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                <Badge className="ml-1 bg-green-500">{completedCalls.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Today
              </Button>
              <Button variant="outline" size="sm">
                This Week
              </Button>
              <Button variant="outline" size="sm">
                This Month
              </Button>
            </div>
          </div>

          <TabsContent value="pending" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingCalls.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No pending service calls found
                </div>
              ) : (
                pendingCalls.map((call) => (
                  <ServiceCallCard
                    key={call.id}
                    serviceCall={call}
                    engineers={engineers}
                    onShowDetails={() => handleShowDetails(call)}
                    onAssign={handleAssignEngineer}
                    onReassign={() => handleReassignCall(call.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="inProgress" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressCalls.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No in-progress service calls found
                </div>
              ) : (
                inProgressCalls.map((call) => (
                  <ServiceCallCard
                    key={call.id}
                    serviceCall={call}
                    engineers={engineers}
                    onShowDetails={() => handleShowDetails(call)}
                    onAssign={handleAssignEngineer}
                    onReassign={() => handleReassignCall(call.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedCalls.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No completed service calls found
                </div>
              ) : (
                completedCalls.map((call) => (
                  <ServiceCallCard
                    key={call.id}
                    serviceCall={call}
                    engineers={engineers}
                    onShowDetails={() => handleShowDetails(call)}
                    onAssign={handleAssignEngineer}
                    onReassign={() => handleReassignCall(call.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCalls.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No service calls found
                </div>
              ) : (
                allCalls.map((call) => (
                  <ServiceCallCard
                    key={call.id}
                    serviceCall={call}
                    engineers={engineers}
                    onShowDetails={() => handleShowDetails(call)}
                    onAssign={handleAssignEngineer}
                    onReassign={() => handleReassignCall(call.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-4">Engineer Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {engineers.map((engineer) => (
              <div 
                key={engineer.id} 
                className="cursor-pointer hover:scale-[1.01] transition-transform"
                onClick={() => handleEngineerCardClick(engineer.id)}
              >
                <EngineerCard engineer={engineer} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl">
          {selectedServiceCall && (
            <ServiceCallDetail 
              serviceCall={selectedServiceCall} 
              onClose={() => setShowDetailDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Service;
