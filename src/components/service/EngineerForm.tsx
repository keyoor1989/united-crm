
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Engineer, EngineerStatus, EngineerSkillLevel } from "@/types/service";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { addDays } from "date-fns";

const engineerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(6, { message: "Phone number must be at least 6 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  location: z.string().min(1, { message: "Location is required" }),
  status: z.enum(["Available", "On Call", "On Leave", "At Warehouse", "Busy"]),
  skillLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
  currentLocation: z.string().optional(),
  leaveEndDate: z.date().optional(),
});

type EngineerFormValues = z.infer<typeof engineerFormSchema>;

interface EngineerFormProps {
  engineer: Engineer;
  onSave: (engineer: Engineer) => void;
  onCancel: () => void;
}

const EngineerForm: React.FC<EngineerFormProps> = ({
  engineer,
  onSave,
  onCancel,
}) => {
  console.log("EngineerForm initialized with values:", engineer);
  
  const form = useForm<EngineerFormValues>({
    resolver: zodResolver(engineerFormSchema),
    defaultValues: {
      name: engineer.name || "",
      phone: engineer.phone || "",
      email: engineer.email || "",
      location: engineer.location || "",
      status: engineer.status || "Available",
      skillLevel: engineer.skillLevel || "Intermediate",
      currentLocation: engineer.currentLocation || "",
      leaveEndDate: engineer.leaveEndDate ? new Date(engineer.leaveEndDate) : undefined,
    },
  });

  const watchStatus = form.watch("status");

  const onSubmit = (data: EngineerFormValues) => {
    console.log("Form submitted with values:", data);
    
    // If status is not "On Leave", remove the leaveEndDate
    const updatedData = { ...data };
    if (data.status !== "On Leave") {
      updatedData.leaveEndDate = undefined;
    }
    
    const updatedEngineer: Engineer = {
      id: engineer.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      location: data.location,
      status: data.status as EngineerStatus,
      skillLevel: data.skillLevel as EngineerSkillLevel,
      currentJob: engineer.currentJob,
      currentLocation: data.currentLocation || data.location,
      leaveEndDate: data.leaveEndDate?.toISOString(),
    };
    
    onSave(updatedEngineer);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {engineer.id ? "Edit Engineer" : "Create New Engineer"}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Engineer name" {...field} />
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
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City/Branch" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="On Call">On Call</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                        <SelectItem value="At Warehouse">At Warehouse</SelectItem>
                        <SelectItem value="Busy">Busy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="skillLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Level</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select skill level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currentLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Location</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Where engineer is currently located" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchStatus === "On Leave" && (
                <FormField
                  control={form.control}
                  name="leaveEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Leave End Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        disabled={(date) => date < new Date()}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Engineer</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default EngineerForm;
