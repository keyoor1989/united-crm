
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GstSelectorProps {
  gstPercent: string;
  onGstChange: (value: string) => void;
}

const GstSelector: React.FC<GstSelectorProps> = ({
  gstPercent,
  onGstChange,
}) => {
  const gstOptions = ["5", "12", "18", "28"];
  
  // Ensure gstPercent is a valid, non-empty value
  const validGstPercent = gstOptions.includes(gstPercent) ? gstPercent : "5";

  return (
    <div className="space-y-2">
      <Label htmlFor="gst">GST Percentage</Label>
      <Select value={validGstPercent} onValueChange={onGstChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select GST %" />
        </SelectTrigger>
        <SelectContent>
          {gstOptions.map(option => (
            <SelectItem key={option} value={option}>
              {option}%
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default GstSelector;
