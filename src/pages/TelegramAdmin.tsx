import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Settings, Bell, MessageSquare, ShieldAlert, Check, X, AlertTriangle, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TelegramConfig {
  id: string;
  bot_token: string;
  webhook_url: string;
  created_at: string;
  updated_at: string;
}

interface AuthorizedChat {
  id: string;
  chat_id: string;
  chat_name: string;
  is_active: boolean;
  created_at: string;
}

interface NotificationPreference {
  id: string;
  chat_id: string;
  service_calls: boolean;
  customer_followups: boolean;
  inventory_alerts: boolean;
}

interface MessageLog {
  id: string;
  chat_id: string;
  message_text: string;
  message_type: string;
  direction: string;
  processed_status: string;
  created_at: string;
}

interface WebhookInfo {
  ok: boolean;
  result: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    last_error_date?: number;
    last_error_message?: string;
    max_connections?: number;
    allowed_updates?: string[];
  };
}

const TelegramAdmin = () => {
  const [botToken, setBotToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [authorizedChats, setAuthorizedChats] = useState<AuthorizedChat[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [newChatId, setNewChatId] = useState("");
  const [chatName, setChatName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWebhook, setIsLoadingWebhook] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [selectedChatId, setSelectedChatId] = useState("");

  useEffect(() => {
    loadTelegramData();
  }, []);

  const loadTelegramData = async () => {
    setIsLoading(true);
    try {
      const { data: configData } = await supabase
        .from('telegram_config')
        .select('*')
        .limit(1)
        .single();

      if (configData) {
        const config = configData as unknown as TelegramConfig;
        setBotToken(config.bot_token);
        setWebhookUrl(config.webhook_url);
      }

      const { data: chatsData } = await supabase
        .from('telegram_authorized_chats')
        .select('*')
        .order('created_at', { ascending: false });

      if (chatsData) {
        const chats = chatsData as unknown as AuthorizedChat[];
        setAuthorizedChats(chats);
        if (chats.length > 0) {
          setSelectedChatId(chats[0].chat_id);
        }
      }

      const { data: prefsData } = await supabase
        .from('telegram_notification_preferences')
        .select('*');

      if (prefsData) {
        const prefs = prefsData as unknown as NotificationPreference[];
        setPreferences(prefs);
      }

      const { data: logsData } = await supabase
        .from('telegram_message_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsData) {
        const logs = logsData as unknown as MessageLog[];
        setMessageLogs(logs);
      }

      if (configData) {
        await getWebhookInfo();
      }
    } catch (error) {
      console.error("Error loading Telegram data:", error);
      toast.error("Failed to load Telegram data");
    } finally {
      setIsLoading(false);
    }
  };

  const getWebhookInfo = async () => {
    setIsLoadingWebhook(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-setup', {
        body: { action: 'getWebhookInfo' },
      });

      if (error) throw error;
      setWebhookInfo(data);
    } catch (error) {
      console.error("Error getting webhook info:", error);
      toast.error("Failed to get webhook info");
    } finally {
      setIsLoadingWebhook(false);
    }
  };

  const setWebhook = async () => {
    setIsLoadingWebhook(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-setup', {
        body: { 
          action: 'setWebhook', 
          webhook_url: webhookUrl 
        },
      });

      if (error) throw error;
      
      if (data.ok) {
        toast.success("Webhook set successfully");
        await getWebhookInfo();
        
        await supabase
          .from('telegram_config')
          .upsert({
            bot_token: botToken,
            webhook_url: webhookUrl,
          } as any);
      } else {
        toast.error(`Failed to set webhook: ${data.description}`);
      }
    } catch (error) {
      console.error("Error setting webhook:", error);
      toast.error("Failed to set webhook");
    } finally {
      setIsLoadingWebhook(false);
    }
  };

  const authorizeChat = async () => {
    if (!newChatId) {
      toast.error("Chat ID is required");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-setup', {
        body: { 
          action: 'authorizeChat', 
          chat_id: newChatId,
          chat_name: chatName || 'Unknown'
        },
      });

      if (error) throw error;
      
      if (data.ok) {
        toast.success("Chat authorized successfully");
        setNewChatId("");
        setChatName("");
        await loadTelegramData();
      } else {
        toast.error(`Failed to authorize chat: ${data.message}`);
      }
    } catch (error) {
      console.error("Error authorizing chat:", error);
      toast.error("Failed to authorize chat");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChatActive = async (chatId: string, isActive: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('telegram_authorized_chats')
        .update({ is_active: !isActive })
        .eq('chat_id', chatId);

      if (error) throw error;
      
      toast.success(`Chat ${isActive ? 'deactivated' : 'activated'} successfully`);
      await loadTelegramData();
    } catch (error) {
      console.error("Error toggling chat active status:", error);
      toast.error("Failed to update chat status");
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationPreference = async (chatId: string, field: string, value: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('telegram_notification_preferences')
        .update({ [field]: value })
        .eq('chat_id', chatId);

      if (error) throw error;
      
      toast.success("Notification preference updated");
      await loadTelegramData();
    } catch (error) {
      console.error("Error updating notification preference:", error);
      toast.error("Failed to update notification preference");
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!selectedChatId || !testMessage) {
      toast.error("Chat ID and message are required");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-notify', {
        body: { 
          notification_type: 'custom',
          data: {
            message: testMessage
          },
          chat_id: selectedChatId
        },
      });

      if (error) throw error;
      
      toast.success("Test message sent successfully");
      setTestMessage("");
      await loadTelegramData();
    } catch (error) {
      console.error("Error sending test message:", error);
      toast.error("Failed to send test message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Telegram Bot Administration</h1>
        <p className="text-muted-foreground">
          Configure and manage your Telegram bot integration
        </p>
      </div>

      <Tabs defaultValue="settings">
        <TabsList className="mb-4">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Bot Settings
          </TabsTrigger>
          <TabsTrigger value="chats" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Authorized Chats
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Settings
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Message Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bot Configuration</CardTitle>
                <CardDescription>
                  Configure your Telegram bot settings and webhook URL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bot-token">Bot Token (from BotFather)</Label>
                    <Input 
                      id="bot-token" 
                      type="password" 
                      placeholder="Enter your Telegram bot token" 
                      value={botToken} 
                      onChange={(e) => setBotToken(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input 
                      id="webhook-url" 
                      type="text" 
                      placeholder="https://your-project.supabase.co/functions/v1/telegram-webhook" 
                      value={webhookUrl} 
                      onChange={(e) => setWebhookUrl(e.target.value)} 
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Webhook Status</h3>
                  {isLoadingWebhook ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading webhook info...</span>
                    </div>
                  ) : webhookInfo ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Status:</span>
                        {webhookInfo.result.url ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Not Set
                          </Badge>
                        )}
                      </div>
                      {webhookInfo.result.url && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Current URL:</span>
                          <span className="text-sm">{webhookInfo.result.url}</span>
                        </div>
                      )}
                      {webhookInfo.result.last_error_message && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Webhook Error</AlertTitle>
                          <AlertDescription>
                            {webhookInfo.result.last_error_message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      No webhook information available
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={deleteWebhook}
                  disabled={isLoadingWebhook || !webhookInfo?.result?.url}
                >
                  {isLoadingWebhook ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Delete Webhook
                </Button>
                <Button 
                  onClick={setWebhook}
                  disabled={isLoadingWebhook || !botToken || !webhookUrl}
                >
                  {isLoadingWebhook ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Set Webhook
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Follow these steps to set up your Telegram bot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Create a new bot on Telegram by messaging <strong>@BotFather</strong> on Telegram</li>
                  <li>Use the <strong>/newbot</strong> command and follow the instructions</li>
                  <li>Copy the bot token provided by BotFather and paste it in the Bot Token field above</li>
                  <li>Enter the webhook URL for your Supabase function (should end with <strong>/telegram-webhook</strong>)</li>
                  <li>Click "Set Webhook" to activate the webhook</li>
                  <li>Start a conversation with your bot on Telegram</li>
                  <li>Add the chat ID to the Authorized Chats tab to enable notifications</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chats">
          <div className="grid gap-6 grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Authorized Chats</CardTitle>
                <CardDescription>
                  Manage the Telegram chats that can interact with your bot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-chat-id">New Chat ID</Label>
                      <Input 
                        id="new-chat-id" 
                        type="text" 
                        placeholder="Enter Telegram chat ID" 
                        value={newChatId} 
                        onChange={(e) => setNewChatId(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chat-name">Chat Name (Optional)</Label>
                      <Input 
                        id="chat-name" 
                        type="text" 
                        placeholder="Enter a name for this chat" 
                        value={chatName} 
                        onChange={(e) => setChatName(e.target.value)} 
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={authorizeChat}
                    disabled={isLoading || !newChatId}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Authorize Chat
                  </Button>
                </div>

                <Separator className="my-4" />

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Chat ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Added On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {authorizedChats.length > 0 ? (
                        authorizedChats.map((chat) => (
                          <TableRow key={chat.id}>
                            <TableCell className="font-mono">{chat.chat_id}</TableCell>
                            <TableCell>{chat.chat_name}</TableCell>
                            <TableCell>{new Date(chat.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {chat.is_active ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  Inactive
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleChatActive(chat.chat_id, chat.is_active)}
                                disabled={isLoading}
                              >
                                {chat.is_active ? 'Deactivate' : 'Activate'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No authorized chats found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="grid gap-6 grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure which types of notifications each chat should receive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
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
                      {authorizedChats.length > 0 ? (
                        authorizedChats.map((chat) => {
                          const pref = preferences.find(p => p.chat_id === chat.chat_id);
                          return (
                            <TableRow key={chat.id}>
                              <TableCell className="font-medium">
                                {chat.chat_name || chat.chat_id}
                                {!chat.is_active && (
                                  <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                                    Inactive
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={pref?.service_calls || false}
                                  onCheckedChange={(checked) => updateNotificationPreference(chat.chat_id, 'service_calls', checked)}
                                  disabled={isLoading || !chat.is_active}
                                />
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={pref?.customer_followups || false}
                                  onCheckedChange={(checked) => updateNotificationPreference(chat.chat_id, 'customer_followups', checked)}
                                  disabled={isLoading || !chat.is_active}
                                />
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={pref?.inventory_alerts || false}
                                  onCheckedChange={(checked) => updateNotificationPreference(chat.chat_id, 'inventory_alerts', checked)}
                                  disabled={isLoading || !chat.is_active}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No authorized chats found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Send Test Message</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="chat-select">Select Chat</Label>
                      <select
                        id="chat-select"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={selectedChatId}
                        onChange={(e) => setSelectedChatId(e.target.value)}
                      >
                        <option value="">Select a chat</option>
                        {authorizedChats
                          .filter(chat => chat.is_active)
                          .map((chat) => (
                            <option key={chat.id} value={chat.chat_id}>
                              {chat.chat_name || chat.chat_id}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="space-y-2 col-span-3">
                      <Label htmlFor="test-message">Message</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="test-message"
                          placeholder="Enter a test message"
                          value={testMessage}
                          onChange={(e) => setTestMessage(e.target.value)}
                        />
                        <Button
                          onClick={sendTestMessage}
                          disabled={isLoading || !selectedChatId || !testMessage}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Message Logs</CardTitle>
              <CardDescription>
                View recent messages sent to and from your Telegram bot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Chat ID</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[40%]">Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messageLogs.length > 0 ? (
                        messageLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                            <TableCell className="font-mono">{log.chat_id}</TableCell>
                            <TableCell>
                              {log.direction === 'incoming' ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  Incoming
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Outgoing
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                log.processed_status === 'customer_created' 
                                  ? "bg-green-50 text-green-700 border-green-200" 
                                  : log.processed_status === 'unauthorized' || log.processed_status === 'invalid_customer'
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                              }>
                                {log.processed_status.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs break-words">
                              {log.message_text}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No message logs found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TelegramAdmin;
