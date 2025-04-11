
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangeFilterProps {
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  dateRange,
  onDateRangeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  // Convert individual dates to DateRange if that API is used
  const range = dateRange || (startDate || endDate ? {
    from: startDate,
    to: endDate
  } : undefined);

  // Handle date range changes and convert to individual methods if needed
  const handleRangeChange = (newRange: DateRange | undefined) => {
    if (onDateRangeChange) {
      onDateRangeChange(newRange);
    } 
    
    if (onStartDateChange && newRange?.from !== startDate) {
      onStartDateChange(newRange?.from);
    }
    
    if (onEndDateChange && newRange?.to !== endDate) {
      onEndDateChange(newRange?.to);
    }
  };

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full md:w-[300px] justify-start text-left font-normal",
              !range?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, "LLL dd, yyyy")} -{" "}
                  {format(range.to, "LLL dd, yyyy")}
                </>
              ) : (
                format(range.from, "LLL dd, yyyy")
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={handleRangeChange}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeFilter;
