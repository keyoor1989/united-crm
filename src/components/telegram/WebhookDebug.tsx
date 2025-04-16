
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, SendIcon, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const WebhookDebug = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testChatId, setTestChatId] = useState("");
  const [isRemovingWebhook, setIsRemovingWebhook] = useState(false);
  const [isSettingCommands, setIsSettingCommands] = useState(false);

  const sendTestMessage = async () => {
    if (!testChatId) {
      toast.error("Please enter a chat ID");
      return;
    }
    
    setIsTesting(true);
    try {
      const { error } = await supabase.functions.invoke("telegram-send-message", {
        body: {
          chat_id: testChatId,
          text: "Test message from debugging tool. If you receive this, your bot is working correctly!",
          parse_mode: "HTML"
        }
      });
      
      if (error) {
        console.error("Error sending test message:", error);
        toast.error("Failed to send test message");
        return;
      }
      
      toast.success("Test message sent successfully");
    } catch (error) {
      console.error("Error in test message:", error);
      toast.error("Failed to send test message");
    } finally {
      setIsTesting(false);
    }
  };

  const removeWebhook = async () => {
    setIsRemovingWebhook(true);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { action: "deleteWebhook" }
      });
      
      if (error) {
        console.error("Error removing webhook:", error);
        toast.error("Failed to remove webhook");
        return;
      }
      
      if (data?.ok) {
        toast.success("Webhook removed successfully");
      } else {
        toast.error("Failed to remove webhook: " + (data?.description || "Unknown error"));
      }
    } catch (error) {
      console.error("Error removing webhook:", error);
      toast.error("Failed to remove webhook");
    } finally {
      setIsRemovingWebhook(false);
    }
  };

  const setCommands = async () => {
    setIsSettingCommands(true);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { action: "setCommands" }
      });
      
      if (error) {
        console.error("Error setting commands:", error);
        toast.error("Failed to set commands");
        return;
      }
      
      if (data?.ok) {
        toast.success("Bot commands set successfully");
      } else {
        toast.error("Failed to set commands: " + (data?.description || "Unknown error"));
      }
    } catch (error) {
      console.error("Error setting commands:", error);
      toast.error("Failed to set commands");
    } finally {
      setIsSettingCommands(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telegram Bot Control Panel</CardTitle>
        <CardDescription>
          Test connection and manage bot configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            If your bot isn't responding to commands, remove the webhook and set up commands using the buttons below.
          </AlertDescription>
        </Alert>
        
        <div className="pt-4">
          <h3 className="font-medium mb-2">Test Bot Connection</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Send a test message to verify the bot is working correctly:
          </p>
          
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="Enter chat ID to test"
              value={testChatId}
              onChange={(e) => setTestChatId(e.target.value)}
            />
            <Button 
              onClick={sendTestMessage}
              disabled={isTesting || !testChatId}
            >
              <SendIcon className="h-4 w-4 mr-2" />
              Test
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Note: The chat ID must be authorized in the "Authorized Chats" tab.
          </p>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium mb-2">Bot Configuration</h3>
          <div className="flex space-x-2 mt-2">
            <Button 
              variant="destructive" 
              onClick={removeWebhook}
              disabled={isRemovingWebhook}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRemovingWebhook ? 'animate-spin' : ''}`} />
              Remove Webhook
            </Button>
            <Button 
              onClick={setCommands}
              disabled={isSettingCommands}
            >
              <SendIcon className="h-4 w-4 mr-2" />
              Set Bot Commands
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            These actions help restore bot functionality if it's not responding to commands.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookDebug;
