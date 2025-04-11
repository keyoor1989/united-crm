
import React, { useState, useEffect } from "react";
import { Key, Bot, Router } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ApiKeyManager = () => {
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [openRouterApiKey, setOpenRouterApiKey] = useState("");
  const [showClaudeApiKey, setShowClaudeApiKey] = useState(false);
  const [showOpenRouterApiKey, setShowOpenRouterApiKey] = useState(false);

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveClaudeApiKey} className="w-full">
            Save Claude API Key
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-5 w-5" />
            OpenRouter API Key
          </CardTitle>
          <CardDescription>
            Set your OpenRouter API key as a fallback option
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
                  placeholder="sk_or_..."
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
        <CardFooter>
          <Button onClick={saveOpenRouterApiKey} className="w-full">
            Save OpenRouter API Key
          </Button>
        </CardFooter>
      </Card>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Manage API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Clear all stored API keys from your browser session.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={clearApiKeys} className="w-full">
              Clear All API Keys
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ApiKeyManager;
