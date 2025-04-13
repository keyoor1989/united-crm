
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomerForm } from "../CustomerFormContext";
import { Separator } from "@/components/ui/separator";
import { Megaphone, Bookmark } from "lucide-react";

const LeadInfoForm = () => {
  const { form } = useCustomerForm();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Lead Information</h3>
      <Separator />
      
      <FormField
        control={form.control}
        name="leadStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lead Status</FormLabel>
            <FormControl>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select lead status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Quoted">Quoted</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="leadSource"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lead Source</FormLabel>
            <FormControl>
              <div className="relative">
                <Megaphone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full pl-8">
                    <SelectValue placeholder="Select lead source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="machineInterest"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Interested Machine(s)</FormLabel>
            <FormControl>
              <div className="relative">
                <Bookmark className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="Machine of interest" {...field} />
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
            <FormControl>
              <div className="relative">
                <Bookmark className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || ""}
                >
                  <SelectTrigger className="w-full pl-8">
                    <SelectValue placeholder="Select machine type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photocopier">Photocopier</SelectItem>
                    <SelectItem value="printer">Printer</SelectItem>
                    <SelectItem value="scanner">Scanner</SelectItem>
                    <SelectItem value="multifunction">Multifunction Device</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default LeadInfoForm;
