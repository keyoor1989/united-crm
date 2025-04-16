
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const WebhookDebug = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isFixing, setIsFixing] = useState(false);

  const fetchDiagnostics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-bot-status");
      
      if (error) {
        toast.error("Failed to get bot status: " + error.message);
        return;
      }
      
      setDiagnostics(data);
      
      // Set webhook URL from diagnostics
      if (data?.webhookInfo?.result?.url) {
        setWebhookUrl(data.webhookInfo.result.url);
      } else {
        // Set default webhook URL if none is set
        setWebhookUrl("https://klieshkrqryigtqtshka.supabase.co/functions/v1/telegram-webhook-proxy");
      }
      
    } catch (error) {
      console.error("Error fetching diagnostics:", error);
      toast.error("Failed to get bot status");
    } finally {
      setIsLoading(false);
    }
  };

  const fixWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL");
      return;
    }
    
    setIsFixing(true);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { 
          action: "setWebhook",
          webhook_url: webhookUrl
        }
      });
      
      if (error) {
        toast.error("Failed to set webhook: " + error.message);
        return;
      }
      
      if (data.ok) {
        toast.success("Webhook set successfully!");
        fetchDiagnostics(); // Refresh diagnostics
      } else {
        toast.error(`Failed to set webhook: ${data.description || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error fixing webhook:", error);
      toast.error("Failed to fix webhook");
    } finally {
      setIsFixing(false);
    }
  };

  const sendTestMessage = async () => {
    if (!diagnostics?.chats?.length) {
      toast.error("No authorized chats found");
      return;
    }
    
    const chatId = diagnostics.chats[0].chat_id;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke("telegram-send-message", {
        body: { 
          chat_id: chatId,
          text: "Test message from webhook debugging tool. If you receive this, your bot is working correctly!"
        }
      });
      
      if (error) {
        toast.error("Failed to send test message: " + error.message);
        return;
      }
      
      if (data.ok) {
        toast.success("Test message sent successfully!");
      } else {
        toast.error(`Failed to send message: ${data.description || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error sending test message:", error);
      toast.error("Failed to send test message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Telegram Bot Diagnostics</span>
          <Button variant="ghost" onClick={fetchDiagnostics} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </CardTitle>
        <CardDescription>
          Debug and fix your Telegram bot webhook connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!diagnostics ? (
          <div className="flex flex-col items-center justify-center p-8">
            <Info className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              Click the refresh button to check your bot's status
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Bot Information</h3>
                {diagnostics.botInfo.ok ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="h-6">Online</Badge>
                    <span>@{diagnostics.botInfo.result.username}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="h-6">Offline</Badge>
                    <span>Bot token issue: {diagnostics.botInfo.description}</span>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Webhook Status</h3>
                {diagnostics.webhookInfo.ok ? (
                  <div className="space-y-2">
                    {diagnostics.webhookInfo.result.url ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="success" className="h-6">Active</Badge>
                        <span className="text-sm truncate max-w-[300px]">{diagnostics.webhookInfo.result.url}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="h-6">Not set</Badge>
                        <span>No webhook URL configured</span>
                      </div>
                    )}
                    
                    {diagnostics.webhookInfo.result.last_error_message && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Last error: {diagnostics.webhookInfo.result.last_error_message}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="text-sm">
                      <span className="font-medium">Pending updates:</span> {diagnostics.webhookInfo.result.pending_update_count}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="h-6">Error</Badge>
                    <span>Failed to get webhook info: {diagnostics.webhookInfo.description}</span>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Authorized Chats</h3>
                {diagnostics.chats.length > 0 ? (
                  <div className="space-y-1">
                    {diagnostics.chats.slice(0, 3).map((chat: any) => (
                      <div key={chat.id} className="flex items-center gap-2">
                        <Badge variant={chat.is_active ? "success" : "secondary"} className="h-6">
                          {chat.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-sm">{chat.chat_name} ({chat.chat_id})</span>
                      </div>
                    ))}
                    {diagnostics.chats.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        + {diagnostics.chats.length - 3} more chats
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="h-6">None</Badge>
                    <span>No authorized chats found</span>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Recent Message Logs</h3>
                {diagnostics.logs.length > 0 ? (
                  <div className="space-y-1 max-h-[200px] overflow-y-auto border rounded-md p-2">
                    {diagnostics.logs.map((log: any) => (
                      <div key={log.id} className="text-xs border-b pb-1 mb-1 last:border-0 last:mb-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Badge variant={log.direction === 'incoming' ? "outline" : "secondary"} className="h-5 text-xs">
                              {log.direction}
                            </Badge>
                            <Badge variant={log.processed_status === 'sent' ? "success" : log.processed_status === 'failed' ? "destructive" : "outline"} className="h-5 text-xs">
                              {log.processed_status}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="mt-1 text-xs truncate">
                          {log.message_text.substring(0, 100)}{log.message_text.length > 100 ? '...' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-6">Empty</Badge>
                    <span>No message logs found</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border rounded-md mt-4">
              <h3 className="text-sm font-medium mb-2">Fix Webhook Connection</h3>
              <div className="flex gap-2 items-center">
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="Enter webhook URL"
                  className="flex-1"
                />
                <Button onClick={fixWebhook} disabled={isFixing}>
                  {isFixing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  {isFixing ? "Setting..." : "Set Webhook"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                The default webhook URL should work in most cases. Click "Set Webhook" to reestablish connection.
              </p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={fetchDiagnostics} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh Status
        </Button>
        <Button onClick={sendTestMessage} disabled={isLoading || !diagnostics?.chats?.length}>
          Send Test Message
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WebhookDebug;
