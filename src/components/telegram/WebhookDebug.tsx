
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, SendIcon, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TelegramConfig } from "@/types/telegram";

const WebhookDebug = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testChatId, setTestChatId] = useState("");
  const [isRemovingWebhook, setIsRemovingWebhook] = useState(false);
  const [isSettingCommands, setIsSettingCommands] = useState(false);
  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [configId, setConfigId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if polling is currently enabled and get the config ID
    checkPollingStatus();
  }, []);

  const checkPollingStatus = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('telegram_config')
        .select('id, use_polling')
        .single();
      
      if (error) {
        console.error("Error checking polling status:", error);
        toast.error("Failed to load Telegram configuration");
        return;
      }
      
      if (data) {
        setConfigId(data.id);
        setIsPollingEnabled(data.use_polling || false);
      }
    } catch (err) {
      console.error("Error checking polling status:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!configId) {
      toast.error("Configuration not found. Please refresh the page.");
      return;
    }

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
        
        // Update config to use polling instead
        const { error: updateError } = await supabase
          .from('telegram_config')
          .update({ 
            webhook_url: null,
            use_polling: true 
          })
          .eq('id', configId);
          
        if (updateError) {
          console.error("Error updating config:", updateError);
          toast.error("Failed to update configuration");
          return;
        }
          
        setIsPollingEnabled(true);
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

  const togglePolling = async () => {
    if (!configId) {
      toast.error("Configuration not found. Please refresh the page.");
      return;
    }

    setIsPolling(true);
    try {
      const newState = !isPollingEnabled;
      
      // Start or stop polling by updating the configuration
      const { error } = await supabase
        .from('telegram_config')
        .update({ 
          use_polling: newState, 
          last_update_id: newState ? 0 : null 
        })
        .eq('id', configId);
      
      if (error) {
        console.error("Error toggling polling:", error);
        toast.error("Failed to update polling status");
        return;
      }
      
      setIsPollingEnabled(newState);
      
      if (newState) {
        // Start polling by calling the function once
        const { error: pollError } = await supabase.functions.invoke("telegram-poll-updates", {
          body: { trigger: "manual" }
        });
        
        if (pollError) {
          console.error("Error triggering polling:", pollError);
          toast.error("Failed to start polling");
          return;
        }
        
        toast.success("Polling activated successfully");
      } else {
        toast.success("Polling deactivated");
      }
    } catch (error) {
      console.error("Error toggling polling:", error);
      toast.error("Failed to update polling status");
    } finally {
      setIsPolling(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            If your bot isn't responding to commands like /help or "Add Customer", follow these steps:
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Click <strong>Remove Webhook</strong> to disable webhook mode</li>
              <li>Click <strong>Set Bot Commands</strong> to register commands</li>
              <li>Click <strong>Enable Message Polling</strong> to activate direct API polling</li>
            </ol>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Webhook Management</h4>
              <Button 
                variant="destructive" 
                onClick={removeWebhook}
                disabled={isRemovingWebhook || !configId}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRemovingWebhook ? 'animate-spin' : ''}`} />
                Remove Webhook
              </Button>
              <p className="text-xs text-muted-foreground">
                Remove webhook to switch to polling mode
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Command Registration</h4>
              <Button 
                onClick={setCommands}
                disabled={isSettingCommands}
                className="w-full"
              >
                <SendIcon className="h-4 w-4 mr-2" />
                Set Bot Commands
              </Button>
              <p className="text-xs text-muted-foreground">
                Register commands with Telegram to enable /help, /start, etc.
              </p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">Polling Configuration</h4>
            <Button 
              variant={isPollingEnabled ? "default" : "outline"} 
              onClick={togglePolling}
              disabled={isPolling || !configId}
              className="w-full"
            >
              {isPollingEnabled ? "Disable" : "Enable"} Message Polling
            </Button>
            <p className="text-xs text-muted-foreground">
              {isPollingEnabled 
                ? "Polling is active - your bot is checking for new messages" 
                : "Enable polling to check for messages without webhooks"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookDebug;
