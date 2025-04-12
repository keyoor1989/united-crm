
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EngineerServiceCallTabs } from "@/components/service/EngineerServiceCallTabs";
import { EngineerProfile } from "@/components/service/EngineerProfile";
import { Engineer, ServiceCall } from "@/types/service";
import { transformEngineersData, transformServiceCallsData } from "@/utils/serviceDataUtils";
import { fetchEngineers, fetchServiceCalls } from "@/services/serviceDataService";

const EngineerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [engineer, setEngineer] = useState<Engineer | null>(null);
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEngineerData = async () => {
      setIsLoading(true);
      if (!id) return;

      // Fetch engineer data
      const { data: engineersData } = await fetchEngineers();
      if (engineersData) {
        const transformedEngineers = transformEngineersData(engineersData);
        const foundEngineer = transformedEngineers.find(eng => eng.id === id);
        setEngineer(foundEngineer || null);
      }

      // Fetch service calls for this engineer
      const { data: serviceCallsData } = await fetchServiceCalls();
      if (serviceCallsData) {
        const transformedCalls = transformServiceCallsData(serviceCallsData);
        const engineerCalls = transformedCalls.filter(call => call.engineerId === id);
        setServiceCalls(engineerCalls);
      }

      setIsLoading(false);
    };

    loadEngineerData();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800";
      case "on leave":
        return "bg-orange-100 text-orange-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "expert":
        return "bg-purple-100 text-purple-800";
      case "senior":
        return "bg-indigo-100 text-indigo-800";
      case "mid-level":
        return "bg-blue-100 text-blue-800";
      case "junior":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!engineer) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-2xl font-bold">Engineer Not Found</h2>
        <p className="text-muted-foreground">The engineer you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/service')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Service Management
        </Button>
      </div>
    );
  }

  // Service call metrics
  const pendingCalls = serviceCalls.filter(call => call.status === "pending");
  const completedCalls = serviceCalls.filter(call => call.status === "completed");
  const inProgressCalls = serviceCalls.filter(call => call.status === "in progress");

  // Calculate revenue metrics
  const calculateRevenue = () => {
    const totalRevenue = completedCalls.reduce((sum, call) => {
      return sum + (typeof call.serviceCharge === 'number' ? call.serviceCharge : 0);
    }, 0);
    
    const paidRevenue = completedCalls.reduce((sum, call) => {
      return sum + (call.isPaid && typeof call.serviceCharge === 'number' ? call.serviceCharge : 0);
    }, 0);
    
    const pendingRevenue = totalRevenue - paidRevenue;
    
    return { totalRevenue, paidRevenue, pendingRevenue };
  };

  const { totalRevenue, paidRevenue, pendingRevenue } = calculateRevenue();

  // Calculate parts metrics
  const partsReconciledCount = completedCalls.filter(call => call.partsReconciled).length;
  const partsNotReconciledCount = completedCalls.length - partsReconciledCount;

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/service')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl">{getInitials(engineer.name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{engineer.name}</CardTitle>
                <Badge className={`mt-2 ${getStatusColor(engineer.status)}`}>
                  {engineer.status}
                </Badge>
                <Badge className={`ml-2 mt-2 ${getSkillLevelColor(engineer.skillLevel)}`}>
                  {engineer.skillLevel}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{engineer.phone}</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{engineer.email}</span>
              </li>
              <li className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{engineer.location}</span>
              </li>
            </ul>
            
            {engineer.status.toLowerCase() === "assigned" && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium">Current Assignment</p>
                <p className="text-sm mt-1">{engineer.currentJob || "No details available"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Location: {engineer.currentLocation || "Not specified"}
                </p>
              </div>
            )}
            
            {engineer.status.toLowerCase() === "on leave" && engineer.leaveEndDate && (
              <div className="mt-4 p-3 bg-orange-50 rounded-md">
                <p className="text-sm font-medium">On Leave Until</p>
                <p className="text-sm">
                  {new Date(engineer.leaveEndDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="service-calls">Service Calls</TabsTrigger>
              <TabsTrigger value="profile">Full Profile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Service Calls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{serviceCalls.length}</div>
                    <p className="text-xs text-muted-foreground">
                      All time assigned service calls
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pendingCalls.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting engineer action
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inProgressCalls.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Currently being worked on
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Completed Calls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{completedCalls.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Successfully resolved issues
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-green-600">Paid: ₹{paidRevenue.toLocaleString()}</p>
                      <p className="text-xs text-orange-600">Pending: ₹{pendingRevenue.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Parts Reconciliation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{partsReconciledCount}/{completedCalls.length}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-green-600">Reconciled: {partsReconciledCount}</p>
                      <p className="text-xs text-orange-600">Pending: {partsNotReconciledCount}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="service-calls">
              <EngineerServiceCallTabs serviceCalls={serviceCalls} />
            </TabsContent>
            
            <TabsContent value="profile">
              <EngineerProfile engineer={engineer} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EngineerDetail;
