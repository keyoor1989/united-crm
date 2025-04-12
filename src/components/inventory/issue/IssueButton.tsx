
import React from "react";
import { Button } from "@/components/ui/button";
import { Box } from "lucide-react";

interface IssueButtonProps {
  selectedItemId: string | null;
}

const IssueButton = ({ selectedItemId }: IssueButtonProps) => {
  return (
    <div className="flex justify-center">
      <Button 
        type="submit" 
        className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-700"
        disabled={!selectedItemId}
      >
        <Box className="mr-2 h-5 w-5" />
        Issue Item
      </Button>
    </div>
  );
};

export default IssueButton;
