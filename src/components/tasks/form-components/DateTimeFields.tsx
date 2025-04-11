
import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface DateTimeFieldsProps {
  form: UseFormReturn<FormValues>;
}

const DateTimeFields: React.FC<DateTimeFieldsProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="dueDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Due Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dueTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Due Time</FormLabel>
            <div className="flex items-center">
              <FormControl>
                <Input
                  type="time"
                  {...field}
                  className="flex-1"
                />
              </FormControl>
              <Clock className="ml-2 h-4 w-4 opacity-50" />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default DateTimeFields;
