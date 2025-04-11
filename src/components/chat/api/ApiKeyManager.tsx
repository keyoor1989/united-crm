
import React, { useState, useEffect } from "react";
import { Key, Bot } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ApiKeyManager = () => {
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [showClaudeApiKey, setShowClaudeApiKey] = useState(false);

  // Load saved API keys on component mount
  useEffect(() => {
    const savedClaudeKey = sessionStorage.getItem("claude_api_key");
    if (savedClaudeKey) setClaudeApiKey(savedClaudeKey);
  }, []);

  const saveClaudeApiKey = () => {
    if (!claudeApiKey) {
      toast.error("Please enter a valid Claude API key");
      return;
    }
    
    sessionStorage.setItem("claude_api_key", claudeApiKey);
    toast.success("Claude API key saved successfully");
  };

  const clearApiKeys = () => {
    sessionStorage.removeItem("claude_api_key");
    setClaudeApiKey("");
    toast.success("API keys cleared successfully");
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Claude AI API Key
          </CardTitle>
          <CardDescription>
            Set your Claude AI API key to use Anthropic's Claude assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex gap-2">
                <Input
                  type={showClaudeApiKey ? "text" : "password"}
                  value={claudeApiKey}
                  onChange={(e) => setClaudeApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={() => setShowClaudeApiKey(!showClaudeApiKey)}
                >
                  {showClaudeApiKey ? "Hide" : "Show"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your API key is stored only in this browser session
              </p>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <h4 className="font-medium mb-1">API Details:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Model: claude-3-sonnet-20240229</li>
                <li>Endpoint: https://api.anthropic.com/v1/messages</li>
                <li>Headers: Anthropic-Version: 2023-06-01</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 items-stretch">
          <Button onClick={saveClaudeApiKey} className="w-full">
            Save Claude API Key
          </Button>
          <Button variant="destructive" onClick={clearApiKeys} className="w-full">
            Clear API Key
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiKeyManager;
