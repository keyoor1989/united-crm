
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, User, Map, Printer, MessageSquare } from "lucide-react";
import CustomerNotes from "./CustomerNotes";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  machineType: z.string().min(1, { message: "Please select a machine type" }),
  area: z.string().min(1, { message: "Please enter customer area" }),
  source: z.string().min(1, { message: "Please select a source" }),
  notes: z.string().optional(),
  leadStatus: z.enum(["New", "Quoted", "Follow-up", "Converted", "Lost"]),
});

type CustomerFormValues = z.infer<typeof formSchema>;

const defaultValues: Partial<CustomerFormValues> = {
  name: "",
  phone: "",
  machineType: "",
  area: "",
  source: "",
  notes: "",
  leadStatus: "New",
};

export default function CustomerFormComponent() {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(data: CustomerFormValues) {
    console.log(data);
    toast.success("Customer information saved successfully!");
    // Here you would typically save the data to your backend
    form.reset();
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-8" placeholder="Enter customer name" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-8" placeholder="Enter phone number" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <div className="relative">
                            <Printer className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <SelectTrigger className="pl-8">
                              <SelectValue placeholder="Select machine type" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kyocera_2554ci">Kyocera 2554ci</SelectItem>
                          <SelectItem value="ricoh_mp2014">Ricoh MP2014</SelectItem>
                          <SelectItem value="xerox_7845">Xerox 7845</SelectItem>
                          <SelectItem value="kyocera_2040">Kyocera 2040</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area</FormLabel>
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
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Source</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="referral" id="referral" />
                            <FormLabel htmlFor="referral" className="font-normal">
                              Referral
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="website" id="website" />
                            <FormLabel htmlFor="website" className="font-normal">
                              Website
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="social_media" id="social_media" />
                            <FormLabel htmlFor="social_media" className="font-normal">
                              Social Media
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cold_call" id="cold_call" />
                            <FormLabel htmlFor="cold_call" className="font-normal">
                              Cold Call
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <FormLabel htmlFor="other" className="font-normal">
                              Other
                            </FormLabel>
                          </div>
                        </RadioGroup>
                      </FormControl>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MessageSquare className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Textarea 
                            placeholder="Add any additional notes here"
                            className="min-h-[120px] pl-8 pt-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">Save Customer</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <CustomerNotes />
    </div>
  );
}
