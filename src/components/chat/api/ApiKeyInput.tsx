
import React from "react";
import { Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  apiType: "claude" | "openrouter";
  onSubmit: (type: "claude" | "openrouter") => void;
}

const ApiKeyInput = ({ apiKey, setApiKey, apiType, onSubmit }: ApiKeyInputProps) => {
  const isClaudeApi = apiType === "claude";
  
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      <div className="bg-muted p-3 rounded-md max-w-[80%]">
        <p className="mb-2">
          {isClaudeApi 
            ? "Please enter your Claude API key:" 
            : "Please enter your OpenRouter API key as a fallback option:"}
        </p>
        <div className="flex gap-2">
          <Input 
            type="password" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={isClaudeApi ? "sk-ant-..." : "sk_or_..."}
            className="flex-1"
          />
          <Button onClick={() => onSubmit(apiType)}>Save</Button>
        </div>
        <p className="text-xs mt-2 text-muted-foreground">
          Your API key is stored only in this browser session.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyInput;
