
import React from "react";
import { Button } from "@/components/ui/button";

interface AISelectorProps {
  preferredAiModel: "openrouter" | "claude";
  togglePreferredAi: () => void;
}

const AISelector = ({ preferredAiModel, togglePreferredAi }: AISelectorProps) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={togglePreferredAi}
        >
          {preferredAiModel === "claude" ? "Using: Claude AI" : "Using: OpenRouter AI"}
        </Button>
      </div>
    </div>
  );
};

export default AISelector;
