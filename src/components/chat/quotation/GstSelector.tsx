
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
  return (
    <div className="space-y-2">
      <Label htmlFor="gst">GST Percentage</Label>
      <Select value={gstPercent} onValueChange={onGstChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select GST %" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5%</SelectItem>
          <SelectItem value="12">12%</SelectItem>
          <SelectItem value="18">18%</SelectItem>
          <SelectItem value="28">28%</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default GstSelector;
