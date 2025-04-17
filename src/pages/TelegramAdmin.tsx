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
import { Check, Copy, Info, X, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTelegram } from "@/contexts/TelegramContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";

const TelegramAdmin = () => {
  const [activeTab, setActiveTab] = useState("setup");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingCommands, setIsSettingCommands] = useState(false);
  const [newChatId, setNewChatId] = useState("");
  const [newChatName, setNewChatName] = useState("");
  const [isAddingChat, setIsAddingChat] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [selectedChatId, setSelectedChatId] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isLoadingWebhookInfo, setIsLoadingWebhookInfo] = useState(false);
  const [webhookSetupError, setWebhookSetupError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const intervalRef = React.useRef<number | null>(null);

  const {
    config, 
    chats,
    preferences,
    webhookInfo,
    isLoading,
    refreshData,
    updateWebhook,
    deleteWebhook,
    addAuthorizedChat,
    toggleChatStatus,
    updateNotificationPreference,
    sendTestMessage,
    setCommands,
    getWebhookInfo
  } = useTelegram();

  useEffect(() => {
    refreshData();
    
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['setup', 'chats', 'notifications', 'test', 'debug'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    const proxyUrl = "https://klieshkrqryigtqtshka.supabase.co/functions/v1/telegram-webhook-proxy";
    
    if (!webhookUrl && !config?.webhook_url) {
      setWebhookUrl(proxyUrl);
    } else if (config?.webhook_url) {
      setWebhookUrl(config.webhook_url);
    }
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refreshData, config, webhookUrl]);

  useEffect(() => {
    if (chats && chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0].chat_id);
    }
  }, [chats, selectedChatId]);

  useEffect(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (activeTab === "setup") {
      intervalRef.current = window.setInterval(() => {
        if (!isLoadingWebhookInfo && !isSaving) {
          setIsLoadingWebhookInfo(true);
          getWebhookInfo()
            .then(info => {
              if (info?.result?.last_error_message) {
                setWebhookSetupError(info.result.last_error_message);
              } else {
                setWebhookSetupError(null);
              }
            })
            .catch(error => {
              console.error("Error fetching webhook info:", error);
              if (error instanceof Error) {
                setWebhookSetupError(error.message);
              }
            })
            .finally(() => {
              setIsLoadingWebhookInfo(false);
            });
        }
      }, 10000);
    }
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeTab, getWebhookInfo, isLoadingWebhookInfo, isSaving]);

  const saveWebhookSettings = async () => {
    setIsSaving(true);
    setWebhookSetupError(null);
    
    try {
      const success = await updateWebhook(webhookUrl);
      
      if (success) {
        toast.success("Webhook configured successfully");
        const info = await getWebhookInfo();
        
        if (info?.result?.last_error_message) {
          setWebhookSetupError(info.result.last_error_message);
          toast.warning("Webhook set but has errors. See details below.");
        }
      } else {
        toast.error("Failed to set webhook");
        setWebhookSetupError("Failed to set webhook. Check console for details.");
      }
    } catch (error) {
      console.error("Error saving webhook settings:", error);
      toast.error("Failed to save webhook settings");
      if (error instanceof Error) {
        setWebhookSetupError(error.message);
      } else {
        setWebhookSetupError("Unknown error setting webhook");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWebhook = async () => {
    setIsSaving(true);
    setWebhookSetupError(null);
    
    try {
      const success = await deleteWebhook();
      
      if (success) {
        setWebhookUrl("");
        toast.success("Webhook deleted successfully");
        await getWebhookInfo();
      } else {
        toast.error("Failed to delete webhook");
        setWebhookSetupError("Failed to delete webhook. Check console for details.");
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast.error("Failed to delete webhook");
      if (error instanceof Error) {
        setWebhookSetupError(error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetCommands = async () => {
    setIsSettingCommands(true);
    try {
      const data = await setCommands();
      
      if (data && data.ok) {
        toast.success("Bot commands set successfully");
      } else {
        const errorMessage = data && data.description ? data.description : "Unknown error";
        toast.error(`Failed to set commands: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error setting commands:", error);
      toast.error("Failed to set bot commands");
    } finally {
      setIsSettingCommands(false);
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

  const manualRefreshWebhookInfo = async () => {
    if (isLoadingWebhookInfo) return;
    
    setIsLoadingWebhookInfo(true);
    setWebhookSetupError(null);
    
    try {
      const info = await getWebhookInfo();
      
      if (info?.result?.last_error_message) {
        setWebhookSetupError(info.result.last_error_message);
      }
    } catch (error) {
      console.error("Error manually refreshing webhook info:", error);
      if (error instanceof Error) {
        setWebhookSetupError(error.message);
      } else {
        setWebhookSetupError("Unknown error fetching webhook info");
      }
    } finally {
      setIsLoadingWebhookInfo(false);
    }
  };

  const fetchDebugInfo = async () => {
    try {
      setDebugInfo({ loading: true });
      
      const response = await fetch("https://klieshkrqryigtqtshka.supabase.co/functions/v1/telegram-webhook-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
          ...(config?.webhook_secret ? { "X-Telegram-Bot-Api-Secret-Token": config.webhook_secret } : {})
        },
        body: JSON.stringify({ type: "debug_request", message: "Testing webhook connection" })
      });
      
      const data = await response.json();
      
      const webhookInfoResponse = await fetch("https://klieshkrqryigtqtshka.supabase.co/functions/v1/telegram-bot-setup", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`
        },
        body: JSON.stringify({ action: "getWebhookInfo" })
      });
      
      const webhookInfoData = await webhookInfoResponse.json();
      
      setDebugInfo({
        directWebhookResponse: {
          status: response.status,
          statusText: response.statusText,
          data
        },
        webhookInfo: webhookInfoData,
        timestamp: new Date().toISOString()
      });
      
      toast.success("Debug info fetched successfully");
    } catch (error) {
      console.error("Error fetching debug info:", error);
      setDebugInfo({
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
      toast.error("Failed to fetch debug information");
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-lg font-medium mb-2">Loading Telegram configuration...</h2>
              <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
            <TabsTrigger value="debug">Debug</TabsTrigger>
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
                  <Alert className="mb-4 bg-blue-50">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Your Telegram bot token is stored securely in Supabase secrets. 
                      If you need to update it, please go to Supabase and update the 'telegram_key' secret.
                    </AlertDescription>
                  </Alert>
                  
                  {webhookSetupError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Webhook Error</AlertTitle>
                      <AlertDescription>
                        {webhookSetupError}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <Label htmlFor="webhookUrl">Webhook URL</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(webhookUrl)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy webhook URL</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input 
                      id="webhookUrl" 
                      value={webhookUrl} 
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="Enter your webhook URL"
                    />
                    <p className="text-sm text-muted-foreground">
                      This is the URL that Telegram will use to send messages to your bot.
                      We're using a proxy endpoint to ensure proper DNS resolution.
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Current Webhook Status:</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={manualRefreshWebhookInfo}
                      disabled={isLoadingWebhookInfo}
                    >
                      {isLoadingWebhookInfo ? (
                        <span className="flex items-center">
                          <div className="w-4 h-4 border-t-2 border-b-2 border-primary rounded-full animate-spin mr-2"></div>
                          Refreshing...
                        </span>
                      ) : "Refresh Status"}
                    </Button>
                  </div>

                  {isLoadingWebhookInfo ? (
                    <div className="flex items-center justify-center h-24">
                      <div className="w-6 h-6 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
                    </div>
                  ) : webhookInfo ? (
                    <div className="rounded-md border p-4 bg-slate-50">
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">URL:</span> {webhookInfo.result.url || "Not set"}</p>
                        <p><span className="font-medium">Pending updates:</span> {webhookInfo.result.pending_update_count}</p>
                        {webhookInfo.result.last_error_message && (
                          <p className="text-red-500"><span className="font-medium">Last error:</span> {webhookInfo.result.last_error_message}</p>
                        )}
                        <p><span className="font-medium">Secret token in DB:</span> {config?.webhook_secret ? "Set" : "Not set"}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md border p-4 bg-slate-50">
                      <p className="text-sm">No webhook information available. Click Refresh Status to check.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <Button 
                    variant="outline" 
                    onClick={handleDeleteWebhook}
                    disabled={isSaving || !webhookUrl}
                    className="mr-2"
                  >
                    Delete Webhook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSetCommands}
                    disabled={isSettingCommands}
                  >
                    {isSettingCommands ? "Setting Commands..." : "Set Bot Commands"}
                  </Button>
                </div>
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

          <TabsContent value="debug">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Debugging</CardTitle>
                <CardDescription>
                  Troubleshoot webhook connection issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert className="mb-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This page helps diagnose issues with your Telegram webhook setup.
                      Press the button below to test your webhook connection and see detailed debug information.
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col gap-4">
                    <Button 
                      onClick={fetchDebugInfo}
                      disabled={debugInfo?.loading}
                    >
                      {debugInfo?.loading ? "Testing Connection..." : "Test Webhook Connection"}
                    </Button>

                    <div className="rounded-md border p-4 bg-slate-50">
                      <h3 className="font-medium mb-2">Webhook Secret Status:</h3>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Secret stored in database:</span> 
                          {config?.webhook_secret ? (
                            <Badge variant="success" className="ml-2">Set</Badge>
                          ) : (
                            <Badge variant="destructive" className="ml-2">Not Set</Badge>
                          )}
                        </p>
                        <p>
                          <span className="font-medium">First 10 characters of secret:</span> 
                          {config?.webhook_secret ? config.webhook_secret.substring(0, 10) + '...' : 'N/A'}
                        </p>
                        <p>
                          <span className="font-medium">Secret length:</span> 
                          {config?.webhook_secret ? config.webhook_secret.length : 0} characters
                        </p>
                      </div>
                    </div>

                    <div className="rounded-md border p-4">
                      <h3 className="font-medium mb-2">Current Telegram API Configuration:</h3>
                      <div className="text-sm">
                        <p><span className="font-medium">Webhook URL:</span> {webhookInfo?.result?.url || 'Not set'}</p>
                        <p><span className="font-medium">Has custom certificate:</span> {webhookInfo?.result?.has_custom_certificate ? 'Yes' : 'No'}</p>
                        <p><span className="font-medium">Pending updates:</span> {webhookInfo?.result?.pending_update_count || 0}</p>
                        <p><span className="font-medium">Max connections:</span> {webhookInfo?.result?.max_connections || 'N/A'}</p>
                        <p><span className="font-medium">IP address:</span> {webhookInfo?.result?.ip_address || 'N/A'}</p>
                        
                        {webhookInfo?.result?.last_error_date && (
                          <div className="mt-2 text-red-500">
                            <p className="font-medium">Last error ({new Date(webhookInfo.result.last_error_date * 1000).toLocaleString()}):</p>
                            <p>{webhookInfo.result.last_error_message}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {debugInfo && !debugInfo.loading && !debugInfo.error && (
                      <div className="rounded-md border p-4">
                        <h3 className="font-medium mb-2">Debug Test Results ({new Date(debugInfo.timestamp).toLocaleString()}):</h3>
                        
                        <div className="mt-2">
                          <h4 className="font-medium">Direct Webhook Response:</h4>
                          <pre className="mt-1 p-2 bg-gray-800 text-white rounded text-xs overflow-auto max-h-40">
                            {JSON.stringify(debugInfo.directWebhookResponse, null, 2)}
                          </pre>
                        </div>
                        
                        <div className="mt-2">
                          <h4 className="font-medium">Webhook Info Response:</h4>
                          <pre className="mt-1 p-2 bg-gray-800 text-white rounded text-xs overflow-auto max-h-40">
                            {JSON.stringify(debugInfo.webhookInfo, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {debugInfo?.error && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Debug Test Failed</AlertTitle>
                        <AlertDescription>
                          {debugInfo.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => window.open("https://klieshkrqryigtqtshka.supabase.co/functions/telegram-bot-setup/logs", "_blank")}>
                  View Edge Function Logs
                </Button>
                <Button variant="outline" onClick={() => window.open("https://klieshkrqryigtqtshka.supabase.co/functions/telegram-webhook-proxy/logs", "_blank")}>
                  View Webhook Proxy Logs
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TelegramAdmin;
