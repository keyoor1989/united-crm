
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
    
    // Basic validation for Claude API key format (most start with "sk-ant-")
    if (!claudeApiKey.startsWith("sk-")) {
      toast.warning("Claude API key usually starts with 'sk-'. Please verify your key format.");
    }
    
    sessionStorage.setItem("claude_api_key", claudeApiKey);
    toast.success("Claude API key saved successfully");
  };

  const clearApiKeys = () => {
    sessionStorage.removeItem("claude_api_key");
    setClaudeApiKey("");
    toast.success("API keys cleared successfully");
  };

  // Test the API connection to validate the key
  const testClaudeConnection = async () => {
    if (!claudeApiKey) {
      toast.error("Please enter a Claude API key first");
      return;
    }

    toast.info("Testing connection to Claude API...");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": claudeApiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 100,
          messages: [
            { role: "user", content: "Hello! This is a test message." }
          ]
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Claude API connection successful!");
      } else {
        toast.error(`Claude API error: ${data.error?.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Claude API test error:", error);
      toast.error(`Connection test failed: ${error instanceof Error ? error.message : "Network or CORS issue"}. Please check your API key and network connection.`);
    }
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
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
              <h4 className="font-medium mb-1 text-yellow-800">Important Notes:</h4>
              <ul className="list-disc pl-4 space-y-1 text-yellow-700">
                <li>Make sure CORS is enabled for your API key</li>
                <li>If you get "Failed to fetch" errors, check your browser's console for details</li>
                <li>Your API key should start with "sk-"</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 items-stretch">
          <Button onClick={saveClaudeApiKey} className="w-full">
            Save Claude API Key
          </Button>
          <Button onClick={testClaudeConnection} variant="outline" className="w-full">
            Test Connection
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
