
import React, { useState, useEffect } from "react";
import { Key, Bot, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ApiKeyManager = () => {
  const [openRouterApiKey, setOpenRouterApiKey] = useState("");
  const [showOpenRouterApiKey, setShowOpenRouterApiKey] = useState(false);

  // Load saved API keys on component mount
  useEffect(() => {
    const savedOpenRouterKey = sessionStorage.getItem("openrouter_api_key");
    if (savedOpenRouterKey) setOpenRouterApiKey(savedOpenRouterKey);
  }, []);

  const saveOpenRouterApiKey = () => {
    if (!openRouterApiKey) {
      toast.error("Please enter a valid OpenRouter API key");
      return;
    }
    
    sessionStorage.setItem("openrouter_api_key", openRouterApiKey);
    toast.success("OpenRouter API key saved successfully");
  };

  const clearApiKeys = () => {
    sessionStorage.removeItem("openrouter_api_key");
    setOpenRouterApiKey("");
    toast.success("API keys cleared successfully");
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Claude AI Integration
          </CardTitle>
          <CardDescription>
            Your Claude API key is securely stored in Supabase Secrets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="bg-green-50 border border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Claude API Connected</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-2">
                  Your Claude API key is securely stored in Supabase Edge Function Secrets and ready to use with your Smart Assistant.
                </p>
                <p>
                  When you input a 10-digit mobile number, the system will fetch customer data from your database and have Claude summarize it.
                </p>
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <h4 className="font-medium mb-1">API Details:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Model: claude-3-opus-20240229</li>
                <li>Integration: Supabase Edge Function</li>
                <li>Security: API key stored as secure secret</li>
                <li>Features: Customer profile summarization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            OpenRouter API Key (Backup)
          </CardTitle>
          <CardDescription>
            Set your OpenRouter API key as a backup option
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
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 items-stretch">
          <Button onClick={saveOpenRouterApiKey} className="w-full">
            Save OpenRouter API Key
          </Button>
          <Button variant="destructive" onClick={clearApiKeys} className="w-full">
            Clear Browser API Keys
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiKeyManager;
