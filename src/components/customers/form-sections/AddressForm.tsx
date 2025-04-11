
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCustomerForm } from "../CustomerFormContext";
import { Building, Map } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const AddressForm = () => {
  const { form } = useCustomerForm();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Address & Classification</h3>
      <Separator />
      
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <div className="relative">
                <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Textarea 
                  placeholder="Enter full address"
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
        name="area"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Area/City</FormLabel>
            <FormControl>
              <div className="relative">
                <Map className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="Enter customer area" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customerType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <FormLabel htmlFor="individual" className="font-normal">
                    Individual
                  </FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="government" id="government" />
                  <FormLabel htmlFor="government" className="font-normal">
                    Government
                  </FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="corporate" id="corporate" />
                  <FormLabel htmlFor="corporate" className="font-normal">
                    Corporate
                  </FormLabel>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AddressForm;
