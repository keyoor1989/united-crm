
import React, { useState, useEffect } from "react";
import { Key, Bot, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ApiKeyManager = () => {
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [showClaudeApiKey, setShowClaudeApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

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
    
    // Basic validation for Claude API key format (most start with "sk-")
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

  // Modified test function to properly handle CORS issues
  const testClaudeConnection = async () => {
    if (!claudeApiKey) {
      toast.error("Please enter a Claude API key first");
      return;
    }

    toast.info("Testing connection to Claude API...");
    setIsTestingConnection(true);

    try {
      // Use a lightweight request to test connectivity rather than a full message request
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "OPTIONS",
        headers: {
          "x-api-key": claudeApiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        }
      });
      
      // If we get any response, it's a good sign
      if (response.ok || response.status === 204) {
        toast.success("Claude API connection successful!");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(`Claude API error: ${errorData.error?.message || "HTTP Status: " + response.status}`);
      }
    } catch (error) {
      console.error("Claude API test error:", error);
      
      // Provide more user-friendly error message for CORS errors
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        toast.error("Connection test failed due to CORS restrictions. This is common when testing from browsers.");
      } else {
        toast.error(`Connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } finally {
      setIsTestingConnection(false);
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
            <Alert className="bg-amber-50 border border-amber-200 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Testing API connections directly from browsers often fails due to CORS restrictions. 
                For production apps, you should use a backend proxy to make API calls.
              </AlertDescription>
            </Alert>
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
                <li>If you get "Failed to fetch" errors, it's likely a CORS issue. This is a browser security feature.</li>
                <li>Your API key should start with "sk-"</li>
                <li>Check browser console for detailed error messages</li>
                <li>For production use, consider implementing a server-side proxy</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 items-stretch">
          <Button onClick={saveClaudeApiKey} className="w-full">
            Save Claude API Key
          </Button>
          <Button 
            onClick={testClaudeConnection} 
            variant="outline" 
            className="w-full"
            disabled={isTestingConnection}
          >
            {isTestingConnection ? (
              <>Testing Connection...</>
            ) : (
              <>Test Connection</>
            )}
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
