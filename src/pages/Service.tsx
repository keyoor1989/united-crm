
import React from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Clock,
  User,
  Printer,
  Wrench,
  ChevronRight,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const Service = () => {
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
          <Button className="gap-1">
            <CalendarCheck className="h-4 w-4" />
            Create Service Call
          </Button>
        </div>

        <Tabs defaultValue="pending">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="pending">
                Pending
                <Badge className="ml-1 bg-amber-500">12</Badge>
              </TabsTrigger>
              <TabsTrigger value="inProgress">
                In Progress
                <Badge className="ml-1 bg-blue-500">4</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                <Badge className="ml-1 bg-green-500">8</Badge>
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

          <TabsContent value="pending" className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ServiceCard
              customer="Govt. Medical College"
              machine="Kyocera 2554ci"
              location="Indore"
              issue="Paper jam error, unable to print"
              status="pending"
              priority="high"
              reportedTime="2 hours ago"
              assignedTo="Rajesh Kumar"
            />
            
            <ServiceCard
              customer="ABC Enterprises"
              machine="Ricoh MP2014"
              location="Bhopal"
              issue="Toner needs replacement"
              status="pending"
              priority="medium"
              reportedTime="5 hours ago"
              assignedTo="Unassigned"
            />
            
            <ServiceCard
              customer="City Hospital"
              machine="Xerox 7845"
              location="Indore"
              issue="Scanning not working"
              status="pending"
              priority="low"
              reportedTime="1 day ago"
              assignedTo="Vikram Singh"
            />
          </TabsContent>

          <TabsContent value="inProgress" className="mt-4">
            <div className="text-center py-10 text-muted-foreground">
              View in-progress service calls
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            <div className="text-center py-10 text-muted-foreground">
              View completed service calls
            </div>
          </TabsContent>
          
          <TabsContent value="all" className="mt-4">
            <div className="text-center py-10 text-muted-foreground">
              View all service calls
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-4">Engineer Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Rajesh Kumar</div>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <MapPin className="h-3 w-3" /> Currently at Govt. Medical College
                    </div>
                    <Badge className="mt-1.5 bg-green-500">Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Vikram Singh</div>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <MapPin className="h-3 w-3" /> En route to City Hospital
                    </div>
                    <Badge className="mt-1.5 bg-blue-500">On Call</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Sunil Sharma</div>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <MapPin className="h-3 w-3" /> Bhopal Office
                    </div>
                    <Badge className="mt-1.5 bg-amber-500">Break</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-700">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Amit Patel</div>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <MapPin className="h-3 w-3" /> Jabalpur Office
                    </div>
                    <Badge className="mt-1.5 bg-red-500">Off Duty</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

interface ServiceCardProps {
  customer: string;
  machine: string;
  location: string;
  issue: string;
  status: "pending" | "inProgress" | "completed";
  priority: "low" | "medium" | "high";
  reportedTime: string;
  assignedTo: string;
}

const ServiceCard = ({
  customer,
  machine,
  location,
  issue,
  status,
  priority,
  reportedTime,
  assignedTo,
}: ServiceCardProps) => {
  const getPriorityBadge = () => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-amber-500">Medium Priority</Badge>;
      case "low":
        return <Badge className="bg-blue-500">Low Priority</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "inProgress":
        return <Wrench className="h-5 w-5 text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-muted p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h3 className="font-semibold">{customer}</h3>
        </div>
        {getPriorityBadge()}
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Printer className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{machine}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Reported {reportedTime}</span>
          </div>

          <div className="py-2 border-t border-b">
            <div className="text-sm font-medium mb-1">Issue:</div>
            <p className="text-sm text-muted-foreground">{issue}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{assignedTo}</span>
            </div>
            <Button variant="ghost" size="sm" className="gap-1">
              Details
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Service;
