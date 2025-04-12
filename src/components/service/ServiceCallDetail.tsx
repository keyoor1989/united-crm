import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  Printer,
  AlertCircle,
  CheckCircle2,
  Phone,
  User,
  Wrench,
  Calendar,
} from "lucide-react";
import { ServiceCall, Part } from "@/types/service";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface ServiceCallDetailProps {
  serviceCall: ServiceCall;
  onClose: () => void;
  onUpdate?: () => void;
}

const ServiceCallDetail: React.FC<ServiceCallDetailProps> = ({
  serviceCall,
  onClose,
  onUpdate,
}) => {
  const { toast } = useToast();
  const [showBillingInfo, setShowBillingInfo] = useState(false);
  const [serviceCharge, setServiceCharge] = useState(serviceCall.serviceCharge || 0);
  const [isPaid, setIsPaid] = useState(serviceCall.isPaid || false);
  const [paymentMethod, setPaymentMethod] = useState(serviceCall.paymentMethod || "");
  const [partsReconciled, setPartsReconciled] = useState(serviceCall.partsReconciled || false);
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    id,
    customerName,
    phone,
    machineModel,
    serialNumber,
    location,
    issueType,
    issueDescription,
    callType,
    priority,
    status,
    createdAt,
    slaDeadline,
    engineerName,
    partsUsed,
  } = serviceCall;
  
  const totalPartsValue = partsUsed?.reduce((total, part) => total + (part.price * part.quantity), 0) || 0;
  
  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_calls')
        .update({
          status: newStatus,
          // If marking as in progress and startTime is not set, set it now
          ...(newStatus === "In Progress" && !serviceCall.startTime 
            ? { start_time: new Date().toISOString() } 
            : {}),
          // If marking as completed, set completionTime
          ...(newStatus === "Completed" 
            ? { completion_time: new Date().toISOString() } 
            : {})
        })
        .eq('id', id);
        
      if (error) {
        console.error("Error updating service call status:", error);
        toast({
          title: "Error",
          description: "Failed to update service call status",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Status Updated",
        description: `Service call status updated to ${newStatus}`,
      });
      
      if (onUpdate) {
        onUpdate();
      }
      
      onClose();
    } catch (error) {
      console.error("Error in status update:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the status",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveBillingInfo = async () => {
    try {
      const { error } = await supabase
        .from('service_calls')
        .update({
          service_charge: serviceCharge,
          is_paid: isPaid,
          payment_method: paymentMethod || null,
          payment_date: isPaid ? new Date().toISOString() : null,
          parts_reconciled: partsReconciled
        })
        .eq('id', id);
        
      if (error) {
        console.error("Error updating billing info:", error);
        toast({
          title: "Error",
          description: "Failed to update billing information",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Billing Updated",
        description: "Service call billing information has been updated",
      });
      
      setIsEditing(false);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error in billing update:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the billing information",
        variant: "destructive",
      });
    }
  };
  
  const formattedCreatedAt = new Date(createdAt).toLocaleString();
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
  const slaDeadlineDate = new Date(slaDeadline);
  const isPastDeadline = isPast(slaDeadlineDate);
  const formattedDeadline = format(slaDeadlineDate, "PPpp");
  
  const getPriorityBadge = () => {
    switch (priority.toLowerCase()) {
      case "critical":
        return <Badge className="bg-red-600">Critical</Badge>;
      case "high":
        return <Badge className="bg-red-500">High</Badge>;
      case "medium-high":
        return <Badge className="bg-amber-600">Medium-High</Badge>;
      case "medium":
        return <Badge className="bg-amber-500">Medium</Badge>;
      case "standard":
        return <Badge className="bg-blue-500">Standard</Badge>;
      case "low":
        return <Badge className="bg-blue-400">Low</Badge>;
      default:
        return <Badge className="bg-blue-500">Standard</Badge>;
    }
  };

  const getStatusBadge = () => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>;
      case "in progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-amber-500">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{customerName}</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{phone}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {getPriorityBadge()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="border rounded-md p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Machine Details</h3>
            <div className="flex items-center gap-2">
              <Printer className="h-4 w-4 text-muted-foreground" />
              <span>{machineModel}</span>
            </div>
            {serialNumber && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span>S/N: {serialNumber}</span>
              </div>
            )}
          </div>

          <div className="border rounded-md p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Location</h3>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{location}</span>
            </div>
          </div>

          <div className="border rounded-md p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Issue Details</h3>
            <div>
              <div className="font-medium">{issueType}</div>
              <p className="text-sm mt-1">{issueDescription}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Call Type: {callType}</span>
            </div>
          </div>
          
          {partsUsed && partsUsed.length > 0 && (
            <div className="border rounded-md p-4 space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Parts Used</h3>
              <ul className="space-y-2">
                {partsUsed.map((part, index) => (
                  <li key={index} className="text-sm">
                    <div className="flex justify-between">
                      <span>{part.name} (x{part.quantity})</span>
                      <span>₹{part.price * part.quantity}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Part #: {part.partNumber}</div>
                  </li>
                ))}
              </ul>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total Parts Value:</span>
                <span>₹{totalPartsValue}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="border rounded-md p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Timing</h3>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div>Created: {formattedCreatedAt}</div>
                <div className="text-sm text-muted-foreground">({timeAgo})</div>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 p-2 rounded-md ${
              isPastDeadline ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
            }`}>
              <Clock className="h-4 w-4" />
              <div>
                <div>SLA Deadline: {formattedDeadline}</div>
                {isPastDeadline && (
                  <div className="text-sm font-medium text-red-700">OVERDUE</div>
                )}
              </div>
            </div>
          </div>

          <div className="border rounded-md p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Assigned Engineer</h3>
            {engineerName ? (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{engineerName}</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No engineer assigned</div>
            )}
          </div>
          
          <div className="border rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-muted-foreground">Billing Information</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowBillingInfo(!showBillingInfo)}
              >
                {showBillingInfo ? "Hide" : "Show"}
              </Button>
            </div>
            
            {showBillingInfo && (
              <div className="space-y-4 pt-2">
                {!isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Service Charge:</div>
                      <div className="font-medium">₹{serviceCall.serviceCharge || 0}</div>
                      
                      <div className="text-muted-foreground">Parts Value:</div>
                      <div className="font-medium">₹{totalPartsValue}</div>
                      
                      <div className="text-muted-foreground">Total Value:</div>
                      <div className="font-medium">₹{(serviceCall.serviceCharge || 0) + totalPartsValue}</div>
                      
                      <div className="text-muted-foreground">Payment Status:</div>
                      <div>
                        <Badge variant={serviceCall.isPaid ? "success" : "outline"}>
                          {serviceCall.isPaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </div>
                      
                      {serviceCall.isPaid && serviceCall.paymentMethod && (
                        <>
                          <div className="text-muted-foreground">Payment Method:</div>
                          <div>{serviceCall.paymentMethod}</div>
                          
                          <div className="text-muted-foreground">Payment Date:</div>
                          <div>{serviceCall.paymentDate ? new Date(serviceCall.paymentDate).toLocaleDateString() : "-"}</div>
                        </>
                      )}
                      
                      <div className="text-muted-foreground">Parts Reconciled:</div>
                      <div>
                        <Badge variant={serviceCall.partsReconciled ? "success" : "destructive"}>
                          {serviceCall.partsReconciled ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setIsEditing(true)}>
                      Edit Billing Info
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="serviceCharge">Service Charge (₹)</Label>
                      <Input
                        id="serviceCharge"
                        type="number"
                        value={serviceCharge}
                        onChange={(e) => setServiceCharge(Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPaid"
                        checked={isPaid}
                        onCheckedChange={setIsPaid}
                      />
                      <Label htmlFor="isPaid">Mark as Paid</Label>
                    </div>
                    
                    {isPaid && (
                      <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                        >
                          <SelectTrigger id="paymentMethod">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                            <SelectItem value="Credit Card">Credit Card</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="partsReconciled"
                        checked={partsReconciled}
                        onCheckedChange={setPartsReconciled}
                      />
                      <Label htmlFor="partsReconciled">Parts Reconciled with Engineer</Label>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" onClick={handleSaveBillingInfo}>
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setServiceCharge(serviceCall.serviceCharge || 0);
                          setIsPaid(serviceCall.isPaid || false);
                          setPaymentMethod(serviceCall.paymentMethod || "");
                          setPartsReconciled(serviceCall.partsReconciled || false);
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {status !== "Completed" && status !== "Cancelled" && (
            <div className="border rounded-md p-4 space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">Actions</h3>
              
              <div className="flex flex-wrap gap-2">
                {status === "Pending" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="gap-1"
                    onClick={() => handleUpdateStatus("In Progress")}
                  >
                    <Wrench className="h-4 w-4" />
                    Start Work
                  </Button>
                )}
                
                {status === "In Progress" && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1 border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => handleUpdateStatus("Completed")}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Completed
                  </Button>
                )}
                
                {(status === "Pending" || status === "In Progress") && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1 border-gray-500 text-gray-600 hover:bg-gray-50"
                    onClick={() => handleUpdateStatus("Cancelled")}
                  >
                    Cancel Service Call
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default ServiceCallDetail;
