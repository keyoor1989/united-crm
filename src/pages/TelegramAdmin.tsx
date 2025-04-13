
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, MessageSquareText, Pencil, Trash, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  AuthorizedChat, 
  MessageLog, 
  NotificationPreference, 
  TelegramConfig, 
  WebhookInfo, 
  TelegramGenericResponse 
} from "@/types/telegram";

const TelegramAdmin = () => {
  const [activeTab, setActiveTab] = useState("setup");
  const [botToken, setBotToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [authorizedChats, setAuthorizedChats] = useState<AuthorizedChat[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [newChatId, setNewChatId] = useState("");
  const [newChatName, setNewChatName] = useState("");
  const [isAddingChat, setIsAddingChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [testMessage, setTestMessage] = useState("");
  const [selectedChatId, setSelectedChatId] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [configResult, chatsResult, logsResult, prefsResult] = await Promise.all([
          supabase.from("telegram_config").select("*").single(),
          supabase.from("telegram_authorized_chats").select("*").order("created_at", { ascending: false }),
          supabase.from("telegram_message_logs").select("*").order("created_at", { ascending: false }).limit(50),
          supabase.from("telegram_notification_preferences").select("*"),
        ]);

        if (configResult.data) {
          setBotToken(configResult.data.bot_token || "");
          setWebhookUrl(configResult.data.webhook_url || "");
          await fetchWebhookInfo(configResult.data.bot_token);
        }

        if (chatsResult.data) setAuthorizedChats(chatsResult.data);
        if (logsResult.data) setMessageLogs(logsResult.data);
        if (prefsResult.data) setPreferences(prefsResult.data);

        if (chatsResult.data && chatsResult.data.length > 0) {
          setSelectedChatId(chatsResult.data[0].chat_id);
        }
      } catch (error) {
        console.error("Error loading Telegram data:", error);
        toast.error("Failed to load Telegram configuration");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchWebhookInfo = async (token: string) => {
    try {
      const { data } = await supabase.functions.invoke("telegram-setup", {
        body: { action: "getWebhookInfo" },
      });
      setWebhookInfo(data);
    } catch (error) {
      console.error("Error fetching webhook info:", error);
    }
  };

  const saveWebhookSettings = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-setup", {
        body: {
          action: "setWebhook",
          webhook_url: webhookUrl,
        },
      });

      if (error) throw error;

      if (data && data.ok) {
        await supabase.from("telegram_config").upsert({
          bot_token: botToken,
          webhook_url: webhookUrl,
          updated_at: new Date().toISOString(),
        });
        
        toast.success("Webhook configured successfully");
        await fetchWebhookInfo(botToken);
      } else {
        toast.error(`Failed to set webhook: ${data?.description || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving webhook settings:", error);
      toast.error("Failed to save webhook settings");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteWebhook = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-setup", {
        body: { action: "deleteWebhook" },
      });

      if (error) throw error;

      if (data && data.ok) {
        await supabase.from("telegram_config").update({
          webhook_url: "",
          updated_at: new Date().toISOString(),
        }).eq("bot_token", botToken);
        
        setWebhookUrl("");
        toast.success("Webhook deleted successfully");
        await fetchWebhookInfo(botToken);
      } else {
        toast.error(`Failed to delete webhook: ${data?.description || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast.error("Failed to delete webhook");
    } finally {
      setIsSaving(false);
    }
  };

  const addAuthorizedChat = async () => {
    if (!newChatId) {
      toast.error("Please enter a Chat ID");
      return;
    }

    setIsAddingChat(true);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-setup", {
        body: {
          action: "authorizeChat",
          chat_id: newChatId,
          chat_name: newChatName || `Chat ${newChatId}`,
        },
      });

      if (error) throw error;

      if (data && data.ok) {
        toast.success("Chat authorized successfully");
        
        // Reload the chats list
        const { data: chatsData } = await supabase
          .from("telegram_authorized_chats")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (chatsData) setAuthorizedChats(chatsData);
        
        setNewChatId("");
        setNewChatName("");
      } else {
        toast.error(`Failed to authorize chat: ${data?.description || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error authorizing chat:", error);
      toast.error("Failed to authorize chat");
    } finally {
      setIsAddingChat(false);
    }
  };

  const toggleChatStatus = async (chatId: string, isActive: boolean) => {
    try {
      await supabase
        .from("telegram_authorized_chats")
        .update({ is_active: !isActive })
        .eq("chat_id", chatId);
      
      // Update local state
      setAuthorizedChats(
        authorizedChats.map(chat => 
          chat.chat_id === chatId 
            ? { ...chat, is_active: !isActive } 
            : chat
        )
      );
      
      toast.success(`Chat ${isActive ? "deactivated" : "activated"} successfully`);
    } catch (error) {
      console.error("Error toggling chat status:", error);
      toast.error("Failed to update chat status");
    }
  };

  const toggleNotificationPreference = async (
    chatId: string, 
    field: "service_calls" | "customer_followups" | "inventory_alerts",
    currentValue: boolean
  ) => {
    try {
      await supabase
        .from("telegram_notification_preferences")
        .update({ [field]: !currentValue })
        .eq("chat_id", chatId);
      
      // Update local state
      setPreferences(
        preferences.map(pref => 
          pref.chat_id === chatId 
            ? { ...pref, [field]: !currentValue } 
            : pref
        )
      );
      
      toast.success("Notification preference updated");
    } catch (error) {
      console.error("Error updating notification preference:", error);
      toast.error("Failed to update notification preference");
    }
  };

  const sendTestMessage = async () => {
    if (!testMessage || !selectedChatId) {
      toast.error("Please enter a message and select a chat");
      return;
    }

    setIsSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-send-message", {
        body: {
          chat_id: selectedChatId,
          text: testMessage,
        },
      });

      if (error) throw error;

      if (data && data.ok) {
        toast.success("Test message sent successfully");
        setTestMessage("");
        
        // Reload message logs
        const { data: logsData } = await supabase
          .from("telegram_message_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        
        if (logsData) setMessageLogs(logsData);
      } else {
        toast.error(`Failed to send message: ${data?.description || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error sending test message:", error);
      toast.error("Failed to send test message");
    } finally {
      setIsSendingTest(false);
    }
  };

  const getPreferencesForChat = (chatId: string) => {
    return preferences.find(pref => pref.chat_id === chatId) || {
      service_calls: false,
      customer_followups: false,
      inventory_alerts: false,
    };
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Telegram Bot Administration</h1>
          <p className="text-muted-foreground">
            Configure and manage your Telegram integration
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="setup">Bot Setup</TabsTrigger>
          <TabsTrigger value="chats">Authorized Chats</TabsTrigger>
          <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
          <TabsTrigger value="logs">Message Logs</TabsTrigger>
          <TabsTrigger value="test">Test Bot</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle>Bot Configuration</CardTitle>
              <CardDescription>
                Configure your bot token and webhook settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="botToken">Bot Token</Label>
                  <Input 
                    id="botToken" 
                    value={botToken} 
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="Enter your Telegram bot token"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Bot token is managed through environment variables for security
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input 
                    id="webhookUrl" 
                    value={webhookUrl} 
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-supabase-function-url/telegram-webhook"
                  />
                  <p className="text-sm text-muted-foreground">
                    URL that Telegram will use to send messages to your bot
                  </p>
                </div>

                {webhookInfo && (
                  <div className="space-y-2 rounded-md border p-4">
                    <h3 className="font-medium">Current Webhook Status</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>URL:</div>
                      <div>{webhookInfo.result.url || "Not set"}</div>
                      
                      <div>Pending updates:</div>
                      <div>{webhookInfo.result.pending_update_count}</div>
                      
                      {webhookInfo.result.last_error_message && (
                        <>
                          <div>Last error:</div>
                          <div className="text-red-500">{webhookInfo.result.last_error_message}</div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={deleteWebhook}
                disabled={isSaving || !webhookUrl}
              >
                Delete Webhook
              </Button>
              <Button 
                onClick={saveWebhookSettings}
                disabled={isSaving || !webhookUrl}
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="chats">
          <Card>
            <CardHeader>
              <CardTitle>Authorized Chats</CardTitle>
              <CardDescription>
                Manage chats that are allowed to use your bot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newChatId">Chat ID</Label>
                    <Input 
                      id="newChatId" 
                      value={newChatId} 
                      onChange={(e) => setNewChatId(e.target.value)}
                      placeholder="Enter chat ID to authorize"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newChatName">Chat Name (optional)</Label>
                    <Input 
                      id="newChatName" 
                      value={newChatName} 
                      onChange={(e) => setNewChatName(e.target.value)}
                      placeholder="Enter a name for this chat"
                    />
                  </div>
                </div>
                <Button 
                  onClick={addAuthorizedChat} 
                  disabled={isAddingChat || !newChatId}
                >
                  {isAddingChat ? "Adding..." : "Add Chat"}
                </Button>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chat ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Added On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authorizedChats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No authorized chats yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      authorizedChats.map((chat) => (
                        <TableRow key={chat.id}>
                          <TableCell>{chat.chat_id}</TableCell>
                          <TableCell>{chat.chat_name}</TableCell>
                          <TableCell>{formatDateTime(chat.created_at)}</TableCell>
                          <TableCell>
                            <Badge variant={chat.is_active ? "success" : "destructive"}>
                              {chat.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleChatStatus(chat.chat_id, chat.is_active)}
                            >
                              {chat.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure which notifications each chat receives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chat</TableHead>
                      <TableHead>Service Calls</TableHead>
                      <TableHead>Customer Follow-ups</TableHead>
                      <TableHead>Inventory Alerts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authorizedChats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No authorized chats to configure
                        </TableCell>
                      </TableRow>
                    ) : (
                      authorizedChats.filter(chat => chat.is_active).map((chat) => {
                        const prefs = getPreferencesForChat(chat.chat_id);
                        return (
                          <TableRow key={chat.id}>
                            <TableCell>{chat.chat_name}</TableCell>
                            <TableCell>
                              <Switch 
                                checked={prefs.service_calls} 
                                onCheckedChange={() => toggleNotificationPreference(
                                  chat.chat_id, 
                                  "service_calls", 
                                  prefs.service_calls
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <Switch 
                                checked={prefs.customer_followups} 
                                onCheckedChange={() => toggleNotificationPreference(
                                  chat.chat_id, 
                                  "customer_followups", 
                                  prefs.customer_followups
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <Switch 
                                checked={prefs.inventory_alerts} 
                                onCheckedChange={() => toggleNotificationPreference(
                                  chat.chat_id, 
                                  "inventory_alerts", 
                                  prefs.inventory_alerts
                                )}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Message Logs</CardTitle>
              <CardDescription>
                Recent message activity with your bot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Chat ID</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messageLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No message logs yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      messageLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{formatDateTime(log.created_at)}</TableCell>
                          <TableCell>{log.chat_id}</TableCell>
                          <TableCell>
                            <Badge variant={log.direction === "incoming" ? "default" : "secondary"}>
                              {log.direction === "incoming" ? "Received" : "Sent"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              log.processed_status === "sent" || log.processed_status === "customer_created" || log.processed_status === "valid_customer" 
                                ? "success" 
                                : log.processed_status === "unauthorized" || log.processed_status === "invalid_customer"
                                ? "destructive"
                                : "outline"
                            }>
                              {log.processed_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {log.message_text}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test Bot</CardTitle>
              <CardDescription>
                Send test messages to your Telegram bot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="selectChat">Select Chat</Label>
                  <select
                    id="selectChat"
                    value={selectedChatId}
                    onChange={(e) => setSelectedChatId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {authorizedChats
                      .filter(chat => chat.is_active)
                      .map((chat) => (
                        <option key={chat.id} value={chat.chat_id}>
                          {chat.chat_name} ({chat.chat_id})
                        </option>
                      ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="testMessage">Message</Label>
                  <Input 
                    id="testMessage" 
                    value={testMessage} 
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Enter a test message to send"
                  />
                </div>
                
                <Button 
                  onClick={sendTestMessage}
                  disabled={isSendingTest || !testMessage || !selectedChatId}
                >
                  {isSendingTest ? "Sending..." : "Send Test Message"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TelegramAdmin;
