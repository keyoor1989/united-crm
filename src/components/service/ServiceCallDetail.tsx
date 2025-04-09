import React, { useState } from "react";
import { 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  Clock, 
  MapPin, 
  Phone, 
  Printer, 
  Mail, 
  User, 
  Wrench, 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle2,
  FileText,
  Image,
  PanelRight,
  Send
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ServiceCall } from "@/types/service";
import { formatDistanceToNow, format } from "date-fns";

interface ServiceCallDetailProps {
  serviceCall: ServiceCall;
  onClose: () => void;
}

const ServiceCallDetail: React.FC<ServiceCallDetailProps> = ({
  serviceCall,
  onClose,
}) => {
  const [newNote, setNewNote] = useState("");
  
  // Simplified for this demo, would be part of the ServiceCall in real implementation
  const [statusHistory] = useState([
    {
      status: "Created",
      timestamp: serviceCall.createdAt,
      user: "Priya Sharma",
    },
    {
      status: "Engineer Assigned",
      timestamp: new Date(new Date(serviceCall.createdAt).getTime() + 30 * 60000).toISOString(),
      user: "System",
    },
    ...(serviceCall.status === "In Progress" || serviceCall.status === "Completed" ? [
      {
        status: "In Progress",
        timestamp: serviceCall.startTime || new Date().toISOString(),
        user: serviceCall.engineerName,
      }
    ] : []),
    ...(serviceCall.status === "Completed" ? [
      {
        status: "Completed",
        timestamp: serviceCall.completionTime || new Date().toISOString(),
        user: serviceCall.engineerName,
      }
    ] : []),
  ]);
  
  const [notes] = useState([
    {
      content: "Customer reported issue with paper jamming repeatedly.",
      timestamp: serviceCall.createdAt,
      author: "Priya Sharma",
      isInternal: true,
    },
    ...(serviceCall.status === "In Progress" || serviceCall.status === "Completed" ? [
      {
        content: "Arrived on site. Machine shows error code E-225. Starting diagnosis.",
        timestamp: serviceCall.startTime || new Date().toISOString(),
        author: serviceCall.engineerName,
        isInternal: false,
      }
    ] : []),
    ...(serviceCall.status === "Completed" ? [
      {
        content: "Replaced paper feed rollers and calibrated paper path. Machine functioning normally now.",
        timestamp: serviceCall.completionTime || new Date().toISOString(),
        author: serviceCall.engineerName,
        isInternal: false,
      }
    ] : []),
  ]);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl flex items-center gap-2">
          Service Call {serviceCall.id}
          <Badge className={serviceCall.status.toLowerCase() === "pending" 
            ? "bg-amber-500" 
            : serviceCall.status.toLowerCase() === "in progress"
              ? "bg-blue-500"
              : "bg-green-500"
          }>
            {serviceCall.status}
          </Badge>
        </DialogTitle>
        <DialogDescription>
          Created {formatDistanceToNow(new Date(serviceCall.createdAt), { addSuffix: true })}
        </DialogDescription>
      </DialogHeader>
      
      <div className="mt-4">
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">Activity Log</TabsTrigger>
            <TabsTrigger value="notes">Notes & Updates</TabsTrigger>
            <TabsTrigger value="parts">Parts & Images</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Customer Information</h3>
                
                <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-md">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">{serviceCall.customerName}</div>
                    <div className="text-sm text-muted-foreground">Customer ID: {serviceCall.customerId}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{serviceCall.phone}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>customer@example.com</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{serviceCall.location}</span>
                </div>
                
                <h3 className="font-semibold text-sm text-muted-foreground mt-4">Machine Details</h3>
                
                <div className="flex items-center gap-2">
                  <Printer className="h-4 w-4 text-gray-500" />
                  <span>{serviceCall.machineModel}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>Serial Number: {serviceCall.serialNumber}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Installed: Jan 15, 2024</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Issue Information</h3>
                
                <div className={`p-3 rounded-md ${
                  serviceCall.priority.toLowerCase() === "high" || serviceCall.priority.toLowerCase() === "critical"
                    ? "bg-red-50" 
                    : serviceCall.priority.toLowerCase().includes("medium")
                      ? "bg-amber-50"
                      : "bg-blue-50"
                }`}>
                  <div className="font-medium">
                    {serviceCall.issueType}
                  </div>
                  <div className="text-sm mt-1">
                    {serviceCall.issueDescription || "No detailed description provided"}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-gray-500" />
                  <span>Call Type: {serviceCall.callType}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>SLA Deadline: {format(new Date(serviceCall.slaDeadline), "PPp")}</span>
                </div>
                
                <h3 className="font-semibold text-sm text-muted-foreground mt-4">Assignment</h3>
                
                {serviceCall.engineerId ? (
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-md">
                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">{serviceCall.engineerName}</div>
                      <div className="text-sm text-muted-foreground">Assigned Engineer</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-amber-50 p-3 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">No engineer assigned</span>
                  </div>
                )}
                
                {serviceCall.status === "In Progress" && (
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-gray-500" />
                    <span>Started: {serviceCall.startTime ? format(new Date(serviceCall.startTime), "PPp") : "N/A"}</span>
                  </div>
                )}
                
                {serviceCall.status === "Completed" && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gray-500" />
                    <span>Completed: {serviceCall.completionTime ? format(new Date(serviceCall.completionTime), "PPp") : "N/A"}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button>Update Status</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4 space-y-4">
            <div className="space-y-4">
              {statusHistory.map((event, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-1 bg-gray-200 rounded relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-brand-500"></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="font-medium">
                      {event.status}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })} by {event.user}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="mt-4 space-y-4">
            <div className="space-y-4">
              {notes.map((note, index) => (
                <div key={index} className={`p-3 rounded-md border ${
                  note.isInternal ? "bg-gray-50" : "bg-white"
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium">{note.author}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                  <p className="text-sm">{note.content}</p>
                  {note.isInternal && (
                    <Badge className="mt-2 bg-gray-500">Internal Note</Badge>
                  )}
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <div className="text-sm font-medium">Add Note</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="cursor-pointer">Internal Only</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Textarea 
                    placeholder="Enter your note or update..." 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Image className="h-4 w-4 mr-1" />
                      Add Image
                    </Button>
                    <Button size="sm" disabled={!newNote.trim()}>
                      <Send className="h-4 w-4 mr-1" />
                      Add Note
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="parts" className="mt-4 space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Parts Used</h3>
              
              {serviceCall.partsUsed && serviceCall.partsUsed.length > 0 ? (
                <div className="space-y-2">
                  {serviceCall.partsUsed.map((part, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-gray-500" />
                        <span>{part.name}</span>
                      </div>
                      <span>x{part.quantity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No parts recorded for this service call
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Input placeholder="Search for parts..." className="flex-1" />
                <Button>Add Part</Button>
              </div>
              
              <h3 className="font-semibold text-sm text-muted-foreground mt-4">Images & Attachments</h3>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-50">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
                <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-50">
                  <PanelRight className="h-8 w-8 text-gray-400" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ServiceCallDetail;
