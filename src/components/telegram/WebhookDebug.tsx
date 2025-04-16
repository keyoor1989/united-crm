
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, RefreshCw, SendIcon, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const WebhookDebug = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<any>(null);
  const [secretStatus, setSecretStatus] = useState<"success" | "error" | null>(null);
  const [testChatId, setTestChatId] = useState("");

  const checkWebhookStatus = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-bot-status");
      
      if (error) {
        console.error("Error checking webhook status:", error);
        toast.error("Failed to check webhook status");
        return;
      }
      
      setWebhookStatus(data);
      
      if (data.webhookInfo && data.webhookInfo.result) {
        // Check if there's an error message
        if (data.webhookInfo.result.last_error_message) {
          toast.error(`Webhook error: ${data.webhookInfo.result.last_error_message}`);
          
          // Detect secret token validation issues
          if (data.webhookInfo.result.last_error_message.includes("401 Unauthorized")) {
            setSecretStatus("error");
            toast.error("Secret token validation failed - please reset the webhook");
          }
        } else {
          toast.success("Webhook is active and working properly");
          setSecretStatus("success");
        }
      }
    } catch (error) {
      console.error("Error in status check:", error);
      toast.error("Failed to check webhook status");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAndResetWebhook = async () => {
    setIsLoading(true);
    try {
      // First delete the webhook
      const { error: deleteError } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { action: "deleteWebhook" }
      });
      
      if (deleteError) {
        console.error("Error deleting webhook:", deleteError);
        toast.error("Failed to delete webhook");
        return;
      }
      
      toast.success("Webhook deleted successfully");
      
      // Get the current webhook URL from status
      let webhookUrl = "";
      if (webhookStatus && webhookStatus.webhookInfo && webhookStatus.webhookInfo.result) {
        webhookUrl = webhookStatus.webhookInfo.result.url;
      }
      
      if (!webhookUrl) {
        webhookUrl = "https://klieshkrqryigtqtshka.supabase.co/functions/v1/telegram-webhook-proxy";
      }
      
      // Now set it again with a new secret token
      const { error: setError } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { 
          action: "setWebhook",
          webhook_url: webhookUrl
        }
      });
      
      if (setError) {
        console.error("Error setting webhook:", setError);
        toast.error("Failed to set webhook");
        return;
      }
      
      toast.success("Webhook reset with new secret token");
      
      // Check status after reset
      await checkWebhookStatus();
    } catch (error) {
      console.error("Error resetting webhook:", error);
      toast.error("Failed to reset webhook");
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
          text: "Test message from webhook debugging tool. If you receive this, your bot is working correctly!",
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

  React.useEffect(() => {
    checkWebhookStatus();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Debug Tool</CardTitle>
        <CardDescription>
          Check and fix your Telegram webhook connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            If your bot is not responding, you may need to reset the webhook due to authentication issues.
          </AlertDescription>
        </Alert>
        
        {webhookStatus && webhookStatus.webhookInfo && (
          <div className="rounded-md border p-4">
            <h3 className="font-medium mb-2">Current Webhook Status:</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium">URL:</span> 
                <span>{webhookStatus.webhookInfo.result.url || "Not set"}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Pending updates:</span> 
                <span>{webhookStatus.webhookInfo.result.pending_update_count}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Secret token validation:</span> 
                <span>
                  {secretStatus === "success" ? (
                    <span className="text-green-500 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Working
                    </span>
                  ) : secretStatus === "error" ? (
                    <span className="text-red-500 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" /> Failed
                    </span>
                  ) : (
                    "Unknown"
                  )}
                </span>
              </div>
              
              {webhookStatus.webhookInfo.result.last_error_message && (
                <div className="pt-2 border-t">
                  <p className="text-red-500 font-medium">Last error:</p>
                  <p className="text-red-500">{webhookStatus.webhookInfo.result.last_error_message}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            onClick={checkWebhookStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Status
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={deleteAndResetWebhook}
            disabled={isLoading}
          >
            Reset Webhook & Secret
          </Button>
        </div>
        
        <div className="pt-4 border-t">
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
      </CardContent>
    </Card>
  );
};

export default WebhookDebug;
