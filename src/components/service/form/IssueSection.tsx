
import React, { useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { ServiceCallFormData } from "@/hooks/useServiceCallForm";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerType } from "@/types/customer";
import { useNavigate } from "react-router-dom";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";

interface IssueSectionProps {
  form: UseFormReturn<ServiceCallFormData>;
  isSubmitting: boolean;
  selectedCustomer: CustomerType | null;
  engineers: any[];
  assignEngineerNow: boolean;
  setAssignEngineerNow: (value: boolean) => void;
  autoAssignEngineer: () => void;
  onSubmit: (data: ServiceCallFormData) => void;
}

const IssueSection: React.FC<IssueSectionProps> = ({
  form,
  isSubmitting,
  selectedCustomer,
  engineers,
  assignEngineerNow,
  setAssignEngineerNow,
  autoAssignEngineer,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const callType = form.watch("callType");
  const isPaidCall = callType === "Paid Call";
  
  useEffect(() => {
    // Reset service charge when call type changes and it's not a paid call
    if (!isPaidCall) {
      form.setValue("serviceCharge", 0);
    }
  }, [callType, form, isPaidCall]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue Information</CardTitle>
        <CardDescription>
          Provide details about the service issue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="issueType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Paper Jam">Paper Jam</SelectItem>
                    <SelectItem value="Print Quality">Print Quality</SelectItem>
                    <SelectItem value="Network Issue">Network Issue</SelectItem>
                    <SelectItem value="Scanner Problem">Scanner Problem</SelectItem>
                    <SelectItem value="Error Code">Error Code</SelectItem>
                    <SelectItem value="Software Issue">Software Issue</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="callType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Call Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select call type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Warranty">Warranty</SelectItem>
                    <SelectItem value="AMC">AMC</SelectItem>
                    <SelectItem value="Out of Warranty">Out of Warranty</SelectItem>
                    <SelectItem value="Rental">Rental</SelectItem>
                    <SelectItem value="Paid Call">Paid Call</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {isPaidCall && (
            <FormField
              control={form.control}
              name="serviceCharge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Charge</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter service charge amount"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Service charge amount for paid call
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!!selectedCustomer}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Medium-High">Medium-High</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2">
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Assign Engineer Now</FormLabel>
                <FormDescription className="text-xs text-muted-foreground">
                  Toggle to assign an engineer immediately or leave for later
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={assignEngineerNow}
                  onCheckedChange={setAssignEngineerNow}
                />
              </FormControl>
            </FormItem>
          </div>

          {assignEngineerNow && (
            <FormField
              control={form.control}
              name="engineerId"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Assign Engineer</FormLabel>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select engineer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {engineers
                          .filter((engineer) => engineer.status === "Available")
                          .map((engineer) => (
                            <SelectItem key={engineer.id} value={engineer.id}>
                              {engineer.name} ({engineer.location})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={autoAssignEngineer}
                      disabled={!selectedCustomer}
                    >
                      Auto-Assign
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="issueDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please describe the issue in detail..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/service")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} onClick={form.handleSubmit(onSubmit)}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Service Call
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IssueSection;
