
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
  const [isClaudeConfigured, setIsClaudeConfigured] = useState(true);

  // Load saved API keys on component mount
  useEffect(() => {
    const savedOpenRouterKey = sessionStorage.getItem("openrouter_api_key");
    if (savedOpenRouterKey) setOpenRouterApiKey(savedOpenRouterKey);
    
    // Check if Claude is configured
    const checkClaudeConfig = async () => {
      try {
        const { data, error } = await fetch('https://klieshkrqryigtqtshka.supabase.co/functions/v1/claude-assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsaWVzaGtycXJ5aWd0cXRzaGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzUxODIsImV4cCI6MjA1OTk1MTE4Mn0.45vdOu9sWjNG9vpDSl637vjRDkeJbJ-wTxRk-cm7ADY`
          },
          body: JSON.stringify({
            prompt: "Hello",
            systemPrompt: "Respond with 'Claude is configured' if you can read this."
          })
        }).then(res => res.json());
        
        if (error || !data || data.error) {
          console.error("Claude connection test failed:", error || data?.error);
          setIsClaudeConfigured(false);
        }
      } catch (error) {
        console.error("Error checking Claude configuration:", error);
        setIsClaudeConfigured(false);
      }
    };
    
    checkClaudeConfig();
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
            {isClaudeConfigured ? (
              <Alert className="bg-green-50 border border-green-200 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Claude API Connected</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-2">
                    Your Claude API key is securely stored in Supabase Edge Function Secrets and ready to use with your Smart Assistant.
                  </p>
                  <p className="mb-2">
                    When you input a 10-digit mobile number, the system will fetch customer data from your database and have Claude summarize it.
                  </p>
                  <p>
                    When you request a quotation, the assistant will guide you through the process and provide a professional summary.
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-amber-50 border border-amber-200 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Claude API Key Not Configured</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-2">
                    Your Claude API key is not properly configured in Supabase Edge Function Secrets.
                  </p>
                  <p>
                    Please contact the administrator to set up the Claude API key.
                  </p>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <h4 className="font-medium mb-1">Sales Assistant Capabilities:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Customer profile lookups via mobile number</li>
                <li>Quotation generation with guided workflow</li>
                <li>Product recommendations based on customer history</li>
                <li>Professional summaries of customer information</li>
                <li>Follow-up and task scheduling</li>
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
