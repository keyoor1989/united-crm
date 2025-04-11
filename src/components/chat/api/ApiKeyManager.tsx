
import React, { useState, useEffect } from "react";
import { Key, Bot, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ApiKeyManager = () => {
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [openRouterApiKey, setOpenRouterApiKey] = useState("");
  const [showClaudeApiKey, setShowClaudeApiKey] = useState(false);
  const [showOpenRouterApiKey, setShowOpenRouterApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Load saved API keys on component mount
  useEffect(() => {
    const savedClaudeKey = sessionStorage.getItem("claude_api_key");
    const savedOpenRouterKey = sessionStorage.getItem("openrouter_api_key");
    if (savedClaudeKey) setClaudeApiKey(savedClaudeKey);
    if (savedOpenRouterKey) setOpenRouterApiKey(savedOpenRouterKey);
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

  const saveOpenRouterApiKey = () => {
    if (!openRouterApiKey) {
      toast.error("Please enter a valid OpenRouter API key");
      return;
    }
    
    sessionStorage.setItem("openrouter_api_key", openRouterApiKey);
    toast.success("OpenRouter API key saved successfully");
  };

  const clearApiKeys = () => {
    sessionStorage.removeItem("claude_api_key");
    sessionStorage.removeItem("openrouter_api_key");
    setClaudeApiKey("");
    setOpenRouterApiKey("");
    toast.success("API keys cleared successfully");
  };

  // Testing function with improved messaging about CORS limitations
  const testClaudeConnection = async () => {
    if (!openRouterApiKey) {
      toast.error("Please enter an OpenRouter API key first");
      return;
    }

    toast.info("Testing connection to OpenRouter API for Claude 3.7...");
    setIsTestingConnection(true);

    try {
      // Note: This will likely fail in a browser environment due to CORS
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json"
        }
      });
      
      // If we somehow get a response, it's a good sign
      if (response.ok) {
        const data = await response.json();
        const claudeModel = data.data.find(model => model.id === "anthropic/claude-3-7-sonnet-20250219");
        
        if (claudeModel) {
          toast.success("Claude 3.7 is available through OpenRouter!");
        } else {
          toast.warning("OpenRouter connection successful, but Claude 3.7 Sonnet model was not found in the available models list.");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(`OpenRouter API error: ${errorData.error?.message || "HTTP Status: " + response.status}`);
      }
    } catch (error) {
      console.error("OpenRouter API test error:", error);
      
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
            Claude AI API Key (via OpenRouter)
          </CardTitle>
          <CardDescription>
            Set your OpenRouter API key to use Claude 3.7 Sonnet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex gap-2">
                <Input
                  type={showOpenRouterApiKey ? "text" : "password"}
                  value={openRouterApiKey}
                  onChange={(e) => setOpenRouterApiKey(e.target.value)}
                  placeholder="OpenRouter API key"
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={() => setShowOpenRouterApiKey(!showOpenRouterApiKey)}
                >
                  {showOpenRouterApiKey ? "Hide" : "Show"}
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
                  <strong>Browser security restrictions (CORS) prevent direct API calls to OpenRouter from the browser.</strong> 
                  Even with a valid API key, the connection test will likely fail with a "Failed to fetch" error.
                </p>
                <p>
                  For production applications, you <strong>must</strong> implement a backend proxy server to handle API calls.
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
                  <li>Test UI flows that would normally use Claude 3.7's API</li>
                  <li>See mock responses for certain features</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <h4 className="font-medium mb-1">API Details:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Model: anthropic/claude-3-7-sonnet-20250219</li>
                <li>Endpoint: https://openrouter.ai/api/v1/chat/completions</li>
                <li>Headers: Authorization: Bearer [your-openrouter-key]</li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
              <h4 className="font-medium mb-1 text-yellow-800">Troubleshooting Tips:</h4>
              <ul className="list-disc pl-4 space-y-1 text-yellow-700">
                <li>"Failed to fetch" errors are usually CORS-related, not API key issues</li>
                <li>Check browser console for detailed error messages</li>
                <li>For actual API usage, implement a server-side proxy</li>
                <li>Make sure your OpenRouter account has access to Claude models</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 items-stretch">
          <Button onClick={saveOpenRouterApiKey} className="w-full">
            Save OpenRouter API Key
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
            Clear API Keys
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiKeyManager;
