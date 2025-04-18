
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export type GstMode = 'no-gst' | 'exclusive' | 'inclusive';

interface GstHandlingSectionProps {
  gstMode: GstMode;
  gstRate: number;
  onGstModeChange: (mode: GstMode) => void;
  onGstRateChange: (rate: number) => void;
}

export const GstHandlingSection: React.FC<GstHandlingSectionProps> = ({
  gstMode,
  gstRate,
  onGstModeChange,
  onGstRateChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="gst-mode">GST Mode</Label>
        <Select value={gstMode} onValueChange={(value: GstMode) => onGstModeChange(value)}>
          <SelectTrigger id="gst-mode">
            <SelectValue placeholder="Select GST mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-gst">No GST</SelectItem>
            <SelectItem value="exclusive">Add GST Separately</SelectItem>
            <SelectItem value="inclusive">GST Inclusive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {gstMode !== 'no-gst' && (
        <div>
          <Label htmlFor="gst-rate">GST Rate (%)</Label>
          <Input
            id="gst-rate"
            type="number"
            min="0"
            max="100"
            value={gstRate}
            onChange={(e) => onGstRateChange(parseFloat(e.target.value) || 0)}
          />
        </div>
      )}
    </div>
  );
};
