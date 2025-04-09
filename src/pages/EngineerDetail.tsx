
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EngineerCard } from "@/components/service/EngineerCard";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Wrench,
  CheckCircle2, 
  AlertTriangle,
  Calendar 
} from "lucide-react";
import { Engineer, ServiceCall } from "@/types/service";
import { mockEngineers, mockServiceCalls } from "@/data/mockData";

const EngineerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [engineer, setEngineer] = useState<Engineer | null>(null);
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchEngineer = () => {
      setLoading(true);
      // Find engineer by ID
      const foundEngineer = mockEngineers.find(eng => eng.id === id);
      if (foundEngineer) {
        setEngineer(foundEngineer);
        
        // Get service calls assigned to this engineer
        const engineerCalls = mockServiceCalls.filter(
          call => call.engineerId === id
        );
        setServiceCalls(engineerCalls);
      }
      setLoading(false);
    };

    fetchEngineer();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading engineer details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!engineer) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold">Engineer Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The engineer you are looking for does not exist or has been removed.
          </p>
          <Button onClick={() => navigate("/service")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Service
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/service")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Service
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{engineer.name}</h1>
            <p className="text-muted-foreground">
              {engineer.skillLevel} Engineer • {engineer.location}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Engineer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <EngineerCard engineer={engineer} showFullDetails={true} />
                
                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{engineer.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{engineer.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Current Location: {engineer.currentLocation}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Service Calls</CardTitle>
              </CardHeader>
              <CardContent>
                {serviceCalls.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Active Service Calls</h3>
                    <p className="text-muted-foreground">
                      {engineer.name} is not currently assigned to any service calls.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceCalls.map(call => (
                      <Card key={call.id} className="overflow-hidden">
                        <div className={`p-2 ${
                          call.status === "Pending" ? "bg-amber-50" :
                          call.status === "In Progress" ? "bg-blue-50" :
                          "bg-green-50"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Wrench className={`h-4 w-4 ${
                                call.status === "Pending" ? "text-amber-500" :
                                call.status === "In Progress" ? "text-blue-500" :
                                "text-green-500"
                              }`} />
                              <span className="font-medium">{call.id}</span>
                            </div>
                            <Badge className={
                              call.status === "Pending" ? "bg-amber-500" :
                              call.status === "In Progress" ? "bg-blue-500" :
                              "bg-green-500"
                            }>
                              {call.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="font-medium">{call.customerName}</div>
                            <div className="text-sm text-muted-foreground">{call.machineModel} ({call.serialNumber})</div>
                            <div className="text-sm">{call.issueType}: {call.issueDescription.substring(0, 60)}...</div>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>Created: {new Date(call.createdAt).toLocaleDateString()}</span>
                              <Clock className="h-3 w-3 ml-2" />
                              <span>SLA: {new Date(call.slaDeadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EngineerDetail;
