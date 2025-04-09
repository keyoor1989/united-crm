
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  Wrench, 
  ChevronLeft,
  Star,
  Activity,
  Clipboard,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { ServiceCall, Engineer } from "@/types/service";
import { mockEngineers, mockServiceCalls } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const EngineerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [engineer, setEngineer] = useState<Engineer | null>(null);
  const [assignedCalls, setAssignedCalls] = useState<ServiceCall[]>([]);
  const [completedCalls, setCompletedCalls] = useState<ServiceCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call
    const engineerData = mockEngineers.find(eng => eng.id === id);
    if (engineerData) {
      setEngineer(engineerData);
      
      // Get this engineer's service calls
      const engineerCalls = mockServiceCalls.filter(call => call.engineerId === id);
      setAssignedCalls(engineerCalls.filter(call => call.status !== "Completed"));
      setCompletedCalls(engineerCalls.filter(call => call.status === "Completed"));
    }
    
    setLoading(false);
  }, [id]);

  const handleStatusChange = (newStatus: string) => {
    if (engineer) {
      // In a real app, this would be an API call
      const updatedEngineer = { ...engineer, status: newStatus };
      setEngineer(updatedEngineer);
      toast({
        title: "Status Updated",
        description: `Engineer status changed to ${newStatus}`,
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      </Layout>
    );
  }

  if (!engineer) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Engineer Not Found</h2>
          <p className="mt-2 text-muted-foreground">The engineer you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" onClick={() => navigate("/service")}>
            Back to Service
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={() => navigate("/service")}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Service
          </Button>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Engineer Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="h-24 w-24 mb-2">
                    <div className="bg-brand-100 text-brand-800 h-full w-full rounded-full flex items-center justify-center text-2xl font-semibold">
                      {engineer.name.charAt(0)}
                    </div>
                  </Avatar>
                  <h2 className="text-xl font-bold">{engineer.name}</h2>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium">{engineer.skillLevel}</span>
                  </div>
                  
                  <div className="mt-2">
                    {(() => {
                      switch (engineer.status.toLowerCase()) {
                        case "available":
                          return <Badge className="bg-green-500">Available</Badge>;
                        case "on call":
                          return <Badge className="bg-blue-500">On Call</Badge>;
                        case "break":
                          return <Badge className="bg-amber-500">Break</Badge>;
                        case "off duty":
                          return <Badge className="bg-red-500">Off Duty</Badge>;
                        default:
                          return <Badge>{engineer.status}</Badge>;
                      }
                    })()}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{engineer.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{engineer.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{engineer.location}</span>
                  </div>
                  
                  {engineer.currentJob && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md">
                      <Wrench className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Current Job</div>
                        <div className="text-sm">{engineer.currentJob}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 inline-block mr-1" /> 
                          {engineer.currentLocation}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <div className="text-sm font-semibold mb-1">Change Status</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant={engineer.status === "Available" ? "default" : "outline"}
                        className={engineer.status === "Available" ? "bg-green-500" : ""}
                        onClick={() => handleStatusChange("Available")}
                      >
                        Available
                      </Button>
                      <Button
                        size="sm"
                        variant={engineer.status === "On Call" ? "default" : "outline"}
                        className={engineer.status === "On Call" ? "bg-blue-500" : ""}
                        onClick={() => handleStatusChange("On Call")}
                      >
                        On Call
                      </Button>
                      <Button
                        size="sm"
                        variant={engineer.status === "Break" ? "default" : "outline"}
                        className={engineer.status === "Break" ? "bg-amber-500" : ""}
                        onClick={() => handleStatusChange("Break")}
                      >
                        Break
                      </Button>
                      <Button
                        size="sm"
                        variant={engineer.status === "Off Duty" ? "default" : "outline"}
                        className={engineer.status === "Off Duty" ? "bg-red-500" : ""}
                        onClick={() => handleStatusChange("Off Duty")}
                      >
                        Off Duty
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full md:w-2/3">
            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="w-full rounded-none border-b grid grid-cols-3">
                    <TabsTrigger value="active">
                      Active Calls
                      {assignedCalls.length > 0 && (
                        <Badge className="ml-2 bg-blue-500">{assignedCalls.length}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      Completed
                      {completedCalls.length > 0 && (
                        <Badge className="ml-2 bg-green-500">{completedCalls.length}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="stats">Performance</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="active" className="p-4">
                    {assignedCalls.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No active service calls assigned
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {assignedCalls.map((call) => (
                          <Card key={call.id} className="overflow-hidden">
                            <div className={`p-3 ${
                              call.status === "In Progress" 
                                ? "bg-blue-100" 
                                : "bg-amber-100"
                            }`}>
                              <div className="flex justify-between items-center">
                                <div className="font-medium">{call.customerName}</div>
                                <Badge className={
                                  call.status === "In Progress" 
                                    ? "bg-blue-500" 
                                    : "bg-amber-500"
                                }>
                                  {call.status}
                                </Badge>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Wrench className="h-4 w-4 text-muted-foreground" />
                                    <span>{call.machineModel}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{call.location}</span>
                                  </div>
                                </div>
                                
                                <div className="py-2 border-t border-b">
                                  <div className="text-sm font-medium">Issue: {call.issueType}</div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {call.issueDescription.substring(0, 100)}
                                    {call.issueDescription.length > 100 ? "..." : ""}
                                  </div>
                                </div>
                                
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      navigate(`/service-call-detail/${call.id}`);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                  {call.status === "Pending" && (
                                    <Button 
                                      size="sm"
                                      onClick={() => {
                                        toast({
                                          title: "Job Started",
                                          description: "You've successfully started this job",
                                        });
                                      }}
                                    >
                                      Start Job
                                    </Button>
                                  )}
                                  {call.status === "In Progress" && (
                                    <Button 
                                      size="sm"
                                      onClick={() => {
                                        toast({
                                          title: "Job Completed",
                                          description: "You've successfully completed this job",
                                        });
                                      }}
                                    >
                                      Complete
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="completed" className="p-4">
                    {completedCalls.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No completed service calls yet
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {completedCalls.map((call) => (
                          <Card key={call.id} className="overflow-hidden">
                            <div className="bg-green-100 p-3">
                              <div className="flex justify-between items-center">
                                <div className="font-medium">{call.customerName}</div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-green-500">Completed</Badge>
                                  {call.feedback && (
                                    <div className="flex items-center">
                                      {Array.from({ length: call.feedback.rating }).map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className="h-4 w-4 text-amber-500 fill-amber-500" 
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Wrench className="h-4 w-4 text-muted-foreground" />
                                    <span>{call.machineModel}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                      {call.completionTime 
                                        ? new Date(call.completionTime).toLocaleDateString() 
                                        : "N/A"}
                                    </span>
                                  </div>
                                </div>
                                
                                {call.partsUsed && call.partsUsed.length > 0 && (
                                  <div className="py-2 border-t border-b">
                                    <div className="text-sm font-medium mb-1">Parts Used:</div>
                                    <div className="text-sm">
                                      {call.partsUsed.map((part, idx) => (
                                        <span key={idx} className="inline-block mr-2 mb-1 px-2 py-1 bg-gray-100 rounded text-xs">
                                          {part.name} (x{part.quantity})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex justify-end">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      navigate(`/service-call-detail/${call.id}`);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="stats" className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Activity className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                            <div className="text-2xl font-bold">
                              {completedCalls.length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Completed Jobs
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Clock className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                            <div className="text-2xl font-bold">
                              1.5 hrs
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Avg. Resolution Time
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                            <div className="text-2xl font-bold">
                              98%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              SLA Compliance
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="text-sm">Average Customer Rating</div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <Star className="h-4 w-4 text-gray-300 fill-gray-300" />
                              <span className="ml-2 font-semibold">4.1</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm">First-Time Fix Rate</div>
                            <div className="font-semibold">85%</div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm">Jobs Completed On Time</div>
                            <div className="font-semibold">92%</div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm">Avg. Travel Time</div>
                            <div className="font-semibold">45 mins</div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm">Repeat Service Calls</div>
                            <div className="font-semibold">7%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EngineerDetail;
