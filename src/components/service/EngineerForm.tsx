
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Engineer } from "@/types/service";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

const engineerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  email: z.string().email("Must be a valid email address"),
  location: z.string().min(2, "Location is required"),
  status: z.string(),
  skillLevel: z.string(),
  currentLocation: z.string().min(2, "Current location is required"),
});

interface EngineerFormProps {
  engineer: Engineer;
  onSave: (engineer: Engineer) => void;
  onCancel?: () => void;
}

const EngineerForm: React.FC<EngineerFormProps> = ({
  engineer,
  onSave,
  onCancel,
}) => {
  // Initialize form with existing engineer data or defaults for new engineer
  const form = useForm<z.infer<typeof engineerSchema>>({
    resolver: zodResolver(engineerSchema),
    defaultValues: {
      name: engineer.name || "",
      phone: engineer.phone || "",
      email: engineer.email || "",
      location: engineer.location || "",
      status: engineer.status || "Available",
      skillLevel: engineer.skillLevel || "Intermediate",
      currentLocation: engineer.currentLocation || engineer.location || "",
    },
  });

  const onSubmit = (values: z.infer<typeof engineerSchema>) => {
    console.log("Form submitted with values:", values);
    onSave({
      ...engineer,
      ...values,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Engineer Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full name" {...field} />
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
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Email" {...field} />
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
                  <Input placeholder="City or location" {...field} />
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
                    <SelectItem value="Break">Break</SelectItem>
                    <SelectItem value="Off Duty">Off Duty</SelectItem>
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
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
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
                    placeholder="Current location"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Engineer
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EngineerForm;
