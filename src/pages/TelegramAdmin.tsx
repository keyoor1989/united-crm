
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
import { Check, MessageSquareText, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTelegram } from "@/contexts/TelegramContext";

const TelegramAdmin = () => {
  const [activeTab, setActiveTab] = useState("setup");
  const [botToken, setBotToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [newChatId, setNewChatId] = useState("");
  const [newChatName, setNewChatName] = useState("");
  const [isAddingChat, setIsAddingChat] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [selectedChatId, setSelectedChatId] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  const {
    config, 
    chats,
    preferences,
    isLoading,
    refreshData,
    updateWebhook,
    deleteWebhook,
    addAuthorizedChat,
    toggleChatStatus,
    updateNotificationPreference,
    sendTestMessage
  } = useTelegram();

  // Load initial data
  useEffect(() => {
    if (config) {
      setBotToken(config.bot_token || "");
      setWebhookUrl(config.webhook_url || "");
    }

    if (chats && chats.length > 0) {
      setSelectedChatId(chats[0].chat_id);
    }
  }, [config, chats]);

  const saveWebhookSettings = async () => {
    setIsSaving(true);
    try {
      const success = await updateWebhook(webhookUrl);
      
      if (success) {
        toast.success("Webhook configured successfully");
      } else {
        toast.error("Failed to set webhook");
      }
    } catch (error) {
      console.error("Error saving webhook settings:", error);
      toast.error("Failed to save webhook settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWebhook = async () => {
    setIsSaving(true);
    try {
      const success = await deleteWebhook();
      
      if (success) {
        setWebhookUrl("");
        toast.success("Webhook deleted successfully");
      } else {
        toast.error("Failed to delete webhook");
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast.error("Failed to delete webhook");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAuthorizedChat = async () => {
    if (!newChatId) {
      toast.error("Please enter a Chat ID");
      return;
    }

    setIsAddingChat(true);
    try {
      const success = await addAuthorizedChat(
        newChatId, 
        newChatName || `Chat ${newChatId}`
      );
      
      if (success) {
        toast.success("Chat authorized successfully");
        setNewChatId("");
        setNewChatName("");
      } else {
        toast.error("Failed to authorize chat");
      }
    } catch (error) {
      console.error("Error authorizing chat:", error);
      toast.error("Failed to authorize chat");
    } finally {
      setIsAddingChat(false);
    }
  };

  const handleToggleChatStatus = async (chatId: string, isActive: boolean) => {
    try {
      const success = await toggleChatStatus(chatId, isActive);
      
      if (success) {
        toast.success(`Chat ${isActive ? "deactivated" : "activated"} successfully`);
      } else {
        toast.error("Failed to update chat status");
      }
    } catch (error) {
      console.error("Error toggling chat status:", error);
      toast.error("Failed to update chat status");
    }
  };

  const handleToggleNotificationPreference = async (
    chatId: string, 
    field: 'service_calls' | 'customer_followups' | 'inventory_alerts',
    currentValue: boolean
  ) => {
    try {
      const success = await updateNotificationPreference(chatId, field, !currentValue);
      
      if (success) {
        toast.success("Notification preference updated");
      } else {
        toast.error("Failed to update notification preference");
      }
    } catch (error) {
      console.error("Error updating notification preference:", error);
      toast.error("Failed to update notification preference");
    }
  };

  const handleSendTestMessage = async () => {
    if (!testMessage || !selectedChatId) {
      toast.error("Please enter a message and select a chat");
      return;
    }

    setIsSendingTest(true);
    try {
      const success = await sendTestMessage(selectedChatId, testMessage);
      
      if (success) {
        toast.success("Test message sent successfully");
        setTestMessage("");
      } else {
        toast.error("Failed to send message");
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

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-lg font-medium mb-2">Loading Telegram configuration...</h2>
            <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

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
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleDeleteWebhook}
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
                  onClick={handleAddAuthorizedChat} 
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
                    {chats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No authorized chats yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      chats.map((chat) => (
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
                              onClick={() => handleToggleChatStatus(chat.chat_id, chat.is_active)}
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
                    {chats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No authorized chats to configure
                        </TableCell>
                      </TableRow>
                    ) : (
                      chats.filter(chat => chat.is_active).map((chat) => {
                        const prefs = getPreferencesForChat(chat.chat_id);
                        return (
                          <TableRow key={chat.id}>
                            <TableCell>{chat.chat_name}</TableCell>
                            <TableCell>
                              <Switch 
                                checked={prefs.service_calls} 
                                onCheckedChange={() => handleToggleNotificationPreference(
                                  chat.chat_id, 
                                  "service_calls", 
                                  prefs.service_calls
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <Switch 
                                checked={prefs.customer_followups} 
                                onCheckedChange={() => handleToggleNotificationPreference(
                                  chat.chat_id, 
                                  "customer_followups", 
                                  prefs.customer_followups
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <Switch 
                                checked={prefs.inventory_alerts} 
                                onCheckedChange={() => handleToggleNotificationPreference(
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
                    {chats
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
                  onClick={handleSendTestMessage}
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
