
import React, { useState, useEffect } from "react";
import { Key, Bot, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  // Testing function with improved messaging about CORS limitations
  const testClaudeConnection = async () => {
    if (!claudeApiKey) {
      toast.error("Please enter a Claude API key first");
      return;
    }

    toast.info("Testing connection to Claude API...");
    setIsTestingConnection(true);

    try {
      // Note: This will likely fail in a browser environment due to CORS
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "OPTIONS",
        headers: {
          "x-api-key": claudeApiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        }
      });
      
      // If we somehow get a response, it's a good sign
      if (response.ok || response.status === 204) {
        toast.success("Claude API connection successful!");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(`Claude API error: ${errorData.error?.message || "HTTP Status: " + response.status}`);
      }
    } catch (error) {
      console.error("Claude API test error:", error);
      
      // Provide clearer error message for CORS errors
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        toast.error(
          "Connection test failed due to CORS restrictions. This is expected behavior when testing from browsers. " +
          "The API key may still be valid, but you need a backend server to make the actual API calls."
        );
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
            
            <Alert variant="destructive" className="bg-red-50 border border-red-200 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important CORS Limitation</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-2">
                  <strong>Browser security restrictions (CORS) prevent direct API calls to Claude from the browser.</strong> 
                  Even with a valid API key, the connection test will likely fail with a "Failed to fetch" error.
                </p>
                <p>
                  For production applications, you <strong>must</strong> implement a backend proxy server to handle Claude API calls.
                  The key stored here is only for demonstration purposes.
                </p>
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-amber-50 border border-amber-200 text-amber-800">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <p className="mb-2">For this demo, you can still:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Save your API key in the browser's session storage</li>
                  <li>Test UI flows that would normally use Claude's API</li>
                  <li>See mock responses for certain features</li>
                </ul>
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
              <h4 className="font-medium mb-1 text-yellow-800">Troubleshooting Tips:</h4>
              <ul className="list-disc pl-4 space-y-1 text-yellow-700">
                <li>"Failed to fetch" errors are usually CORS-related, not API key issues</li>
                <li>Your API key should start with "sk-"</li>
                <li>Check browser console for detailed error messages</li>
                <li>For actual API usage, implement a server-side proxy</li>
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
