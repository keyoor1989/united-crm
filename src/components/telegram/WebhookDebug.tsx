
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const WebhookDebug = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testChatId, setTestChatId] = useState("");

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telegram Connection Test</CardTitle>
        <CardDescription>
          Send a test message to verify your Telegram bot is working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            This tool allows you to send a test message to verify that your bot is functioning correctly.
            No webhook is required for sending notifications.
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
      </CardContent>
    </Card>
  );
};

export default WebhookDebug;
