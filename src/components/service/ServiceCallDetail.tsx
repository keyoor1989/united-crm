import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ServiceCall, Engineer } from "@/types/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, Download, ThumbsUp, User, XCircle } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface ServiceCallDetailProps {
  serviceCall: ServiceCall;
  engineers: Engineer[];
  onClose: () => void;
  refreshCalls: () => void;
}

const ServiceCallDetail: React.FC<ServiceCallDetailProps> = ({
  serviceCall,
  engineers,
  onClose,
  refreshCalls,
}) => {
  const { toast } = useToast();
  const [selectedEngineer, setSelectedEngineer] = useState<string | null>(
    serviceCall.engineerId
  );
  const [statusChange, setStatusChange] = useState(serviceCall.status);
  const [ratingValue, setRatingValue] = useState<number>(
    serviceCall.feedback?.rating || 0
  );
  const [feedbackText, setFeedbackText] = useState<string | null>(
    serviceCall.feedback?.comment || null
  );
  const [serviceCharge, setServiceCharge] = useState<number>(
    serviceCall.serviceCharge || 0
  );
  const [isPaid, setIsPaid] = useState<boolean>(serviceCall.isPaid || false);
  const [partsReconciled, setPartsReconciled] = useState<boolean>(
    serviceCall.partsReconciled || false
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getSLAStatus = () => {
    const now = new Date();
    const deadline = new Date(serviceCall.slaDeadline);
    if (serviceCall.status === "Completed") {
      return "success";
    }
    return now > deadline ? "destructive" : "success";
  };

  const timeFromNow = (date: string): string => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - eventDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    }
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
  };

  const handleUpdateServiceCall = async () => {
    setIsSubmitting(true);
    try {
      // Build feedback object if rating exists
      const feedback =
        ratingValue > 0
          ? {
              rating: ratingValue,
              comment: feedbackText,
              date: new Date().toISOString(),
            }
          : null;

      // Prepare completion time for status change
      let completionTime = serviceCall.completionTime;
      let startTime = serviceCall.startTime;

      if (statusChange === "Completed" && !serviceCall.completionTime) {
        completionTime = new Date().toISOString();
      }

      if (statusChange === "In Progress" && !serviceCall.startTime) {
        startTime = new Date().toISOString();
      }

      // Update engineer if changed
      let updatedEngineerName = serviceCall.engineerName;
      if (selectedEngineer && selectedEngineer !== serviceCall.engineerId) {
        const engineer = engineers.find((e) => e.id === selectedEngineer);
        if (engineer) {
          updatedEngineerName = engineer.name;
        }
      }

      // Update service call
      const { error } = await supabase
        .from("service_calls")
        .update({
          status: statusChange,
          engineer_id: selectedEngineer,
          engineer_name: updatedEngineerName,
          start_time: startTime,
          completion_time: completionTime,
          feedback: feedback,
          service_charge: serviceCharge,
          is_paid: isPaid,
          payment_date: isPaid && !serviceCall.isPaid ? new Date().toISOString() : serviceCall.paymentDate,
          parts_reconciled: partsReconciled,
        })
        .eq("id", serviceCall.id);

      if (error) {
        console.error("Error updating service call:", error);
        toast({
          title: "Error",
          description: "Failed to update service call",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // If engineer changed, update the engineer's status
      if (selectedEngineer && selectedEngineer !== serviceCall.engineerId) {
        const { error: engineerError } = await supabase
          .from("engineers")
          .update({
            status: "On Call",
            current_job: `Service Call #${serviceCall.id}`,
            current_location: serviceCall.location,
          })
          .eq("id", selectedEngineer);

        if (engineerError) {
          console.error("Error updating engineer:", engineerError);
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Service call updated but failed to update engineer status",
          });
        }

        // If previous engineer exists, update their status too
        if (serviceCall.engineerId) {
          const { error: prevEngineerError } = await supabase
            .from("engineers")
            .update({
              status: "Available",
              current_job: null,
              current_location: "Office",
            })
            .eq("id", serviceCall.engineerId);

          if (prevEngineerError) {
            console.error(
              "Error updating previous engineer:",
              prevEngineerError
            );
          }
        }
      }

      // If status changed to Completed, update engineer status
      if (
        statusChange === "Completed" &&
        serviceCall.status !== "Completed" &&
        selectedEngineer
      ) {
        const { error: completeEngineerError } = await supabase
          .from("engineers")
          .update({
            status: "Available",
            current_job: null,
            current_location: "Office",
          })
          .eq("id", selectedEngineer);

        if (completeEngineerError) {
          console.error(
            "Error updating engineer on completion:",
            completeEngineerError
          );
        }
      }

      toast({
        title: "Success",
        description: "Service call updated successfully",
      });

      refreshCalls();
      onClose();
    } catch (err) {
      console.error("Unexpected error updating service call:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRatingValue(star)}
            className={`text-2xl ${
              star <= ratingValue ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">
            Service Call #{serviceCall.id.substring(0, 8)}
          </h2>
          <p className="text-muted-foreground">
            Created on {format(new Date(serviceCall.createdAt), "PPP")}
          </p>
        </div>
        <Badge
          variant={
            serviceCall.status === "Pending"
              ? "outline"
              : serviceCall.status === "In Progress"
              ? "secondary"
              : "default"
          }
          className="text-sm"
        >
          {serviceCall.status}
        </Badge>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
          <div className="space-y-3">
            <div>
              <Label>Customer Name</Label>
              <p className="text-sm font-medium">{serviceCall.customerName}</p>
            </div>
            <div>
              <Label>Phone</Label>
              <p className="text-sm font-medium">{serviceCall.phone}</p>
            </div>
            <div>
              <Label>Location</Label>
              <p className="text-sm font-medium">{serviceCall.location}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Machine Details</h3>
          <div className="space-y-3">
            <div>
              <Label>Machine Model</Label>
              <p className="text-sm font-medium">{serviceCall.machineModel}</p>
            </div>
            <div>
              <Label>Serial Number</Label>
              <p className="text-sm font-medium">{serviceCall.serialNumber || "N/A"}</p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>SLA Deadline</Label>
                <Badge variant={getSLAStatus()}>
                  {getSLAStatus() === "destructive" ? "Overdue" : "On Track"}
                </Badge>
              </div>
              <p className="text-sm font-medium">
                {format(new Date(serviceCall.slaDeadline), "PPp")}
                {serviceCall.status !== "Completed" && (
                  <span className="text-xs ml-2 text-muted-foreground">
                    {new Date() > new Date(serviceCall.slaDeadline)
                      ? `(${timeFromNow(serviceCall.slaDeadline)} overdue)`
                      : `(${timeFromNow(serviceCall.slaDeadline)} remaining)`}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Issue Details</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Issue Type</Label>
              <p className="text-sm font-medium">{serviceCall.issueType}</p>
            </div>
            <div>
              <Label>Call Type</Label>
              <p className="text-sm font-medium">{serviceCall.callType}</p>
            </div>
            <div>
              <Label>Priority</Label>
              <p className="text-sm font-medium">{serviceCall.priority}</p>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <p className="text-sm">{serviceCall.issueDescription}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Service Information</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="engineer">Assigned Engineer</Label>
                <Select
                  value={selectedEngineer || ""}
                  onValueChange={setSelectedEngineer}
                  disabled={serviceCall.status === "Completed"}
                >
                  <SelectTrigger id="engineer">
                    <SelectValue placeholder="Select an engineer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {engineers
                      .filter(
                        (e) =>
                          e.status === "Available" ||
                          e.id === serviceCall.engineerId
                      )
                      .map((engineer) => (
                        <SelectItem key={engineer.id} value={engineer.id}>
                          {engineer.name} ({engineer.location})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={statusChange}
                  onValueChange={setStatusChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {statusChange === "Completed" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rating">Customer Rating</Label>
                    {renderStarRating()}
                  </div>

                  <div>
                    <Label htmlFor="feedback">Customer Feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Enter customer feedback"
                      value={feedbackText || ""}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="serviceCharge">Service Charge (₹)</Label>
                <Input
                  id="serviceCharge"
                  type="number"
                  value={serviceCharge}
                  onChange={(e) => setServiceCharge(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="isPaid" className="cursor-pointer">
                  Mark as Paid
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="partsReconciled"
                  checked={partsReconciled}
                  onChange={(e) => setPartsReconciled(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="partsReconciled" className="cursor-pointer">
                  Parts Reconciled
                </Label>
              </div>

              {serviceCall.partsUsed && serviceCall.partsUsed.length > 0 && (
                <div>
                  <Label>Parts Used</Label>
                  <div className="mt-2 space-y-2">
                    {serviceCall.partsUsed.map((part) => (
                      <div
                        key={part.id}
                        className="flex justify-between text-sm p-2 bg-gray-50 rounded"
                      >
                        <span>
                          {part.name} (x{part.quantity})
                        </span>
                        <span>₹{part.price * part.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateServiceCall}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Service Call"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCallDetail;
