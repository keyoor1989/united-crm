
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useCustomerForm } from "../CustomerFormContext";
import { Printer } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const LeadInfoForm = () => {
  const { form, isNewCustomer } = useCustomerForm();

  if (!isNewCustomer) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Machine Information</h3>
        <Separator />
        <div className="p-4 border rounded-md bg-muted/50">
          <p className="text-muted-foreground text-sm mb-2">
            Existing customer machines will be displayed here.
          </p>
          <Button type="button" variant="outline" size="sm" className="w-full">
            Add New Machine
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Lead Information</h3>
      <Separator />
      
      <FormField
        control={form.control}
        name="machineInterest"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Machine Interest</FormLabel>
            <FormControl>
              <div className="relative">
                <Printer className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Textarea 
                  placeholder="Enter machines customer is interested in"
                  className="min-h-[80px] pl-8 pt-8"
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="machineType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Machine Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || "printer"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select machine type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="printer">Printer</SelectItem>
                <SelectItem value="scanner">Scanner</SelectItem>
                <SelectItem value="copier">Copier</SelectItem>
                <SelectItem value="multifunctional">Multifunctional</SelectItem>
                <SelectItem value="large_format">Large Format</SelectItem>
                <SelectItem value="3d_printer">3D Printer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="source"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lead Source</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || "website"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead source" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="cold_call">Cold Call</SelectItem>
                <SelectItem value="exhibition">Exhibition</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="leadStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lead Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || "New"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Quoted">Quoted</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default LeadInfoForm;
