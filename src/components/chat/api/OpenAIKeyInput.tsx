
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const OpenAIKeyInput = () => {
  const [openAIKey, setOpenAIKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Check if key exists in session storage
    const savedKey = sessionStorage.getItem("openai_api_key");
    if (savedKey) {
      setOpenAIKey("•".repeat(16)); // Show masked value
      setIsSaved(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (!openAIKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    if (openAIKey.startsWith("sk-") || openAIKey.length > 20) {
      sessionStorage.setItem("openai_api_key", openAIKey);
      setIsSaved(true);
      toast.success("OpenAI API key saved successfully");
    } else {
      toast.error("Invalid OpenAI API key format");
    }
  };

  const handleClearKey = () => {
    sessionStorage.removeItem("openai_api_key");
    setOpenAIKey("");
    setIsSaved(false);
    toast.info("OpenAI API key removed");
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          OpenAI API Key
          {isSaved && <CheckCircle className="h-5 w-5 text-green-500" />}
        </CardTitle>
        <CardDescription>
          Add your OpenAI API key to enable LangChain for enhanced quotation generation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            type="password"
            placeholder={isSaved ? "API key saved" : "sk-..."}
            value={openAIKey}
            onChange={(e) => setOpenAIKey(e.target.value)}
            className="flex-1"
          />
          {isSaved ? (
            <Button variant="outline" onClick={handleClearKey}>
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          ) : (
            <Button onClick={handleSaveKey}>Save Key</Button>
          )}
        </div>
        <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Your API key is stored in your browser and not sent to our servers.
        </div>
      </CardContent>
    </Card>
  );
};

export default OpenAIKeyInput;
