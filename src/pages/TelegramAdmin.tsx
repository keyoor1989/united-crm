
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MessageSquare, ShieldCheck, Webhook, Send, Trash2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Types definition
interface TelegramConfig {
  id: string;
  webhook_url: string;
  webhook_secret: string;
  created_at: string;
}

interface WebhookInfo {
  ok: boolean;
  result: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    max_connections: number;
    ip_address: string;
    last_error_date?: number;
    last_error_message?: string;
    allowed_updates: string[];
  };
}

interface AuthorizedChat {
  id: string;
  chat_id: string;
  user_name: string | null;
  is_active: boolean;
  authorized_by: string | null;
  notes: string | null;
  created_at: string;
}

interface MessageLog {
  id: string;
  chat_id: string;
  message_text: string;
  message_type: string;
  direction: string;
  processed_status: string;
  error_message: string | null;
  created_at: string;
}

const TelegramAdmin = () => {
  const [config, setConfig] = useState<TelegramConfig | null>(null);
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [webhookStatus, setWebhookStatus] = useState<"active" | "inactive" | "error" | "loading">("loading");
  const [webhookInput, setWebhookInput] = useState("");
  const [isUpdatingWebhook, setIsUpdatingWebhook] = useState(false);
  const [authorizedChats, setAuthorizedChats] = useState<AuthorizedChat[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [isAddChatDialogOpen, setIsAddChatDialogOpen] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const chatForm = useForm({
    defaultValues: {
      chat_id: "",
      user_name: "",
      notes: "",
      is_active: true
    }
  });

  // Fetch Telegram config on component mount
  useEffect(() => {
    fetchTelegramConfig();
    fetchAuthorizedChats();
    fetchMessageLogs();
  }, []);

  useEffect(() => {
    if (config?.webhook_url) {
      setWebhookInput(config.webhook_url);
      fetchWebhookInfo();
    } else {
      setWebhookStatus("inactive");
    }
  }, [config]);

  // Fetch Telegram configuration from database
  const fetchTelegramConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('telegram_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching Telegram config:", error);
        setConfig(null);
        return;
      }

      setConfig(data);
    } catch (error) {
      console.error("Error in fetchTelegramConfig:", error);
      toast.error("Failed to fetch Telegram configuration");
    }
  };

  // Get webhook information from Telegram API
  const fetchWebhookInfo = async () => {
    setWebhookStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke('telegram-bot-setup', {
        body: { action: 'getWebhookInfo' }
      });

      if (error) {
        console.error("Error fetching webhook info:", error);
        setWebhookStatus("error");
        return;
      }

      setWebhookInfo(data);
      
      if (data.ok && data.result.url) {
        setWebhookStatus("active");
      } else {
        setWebhookStatus("inactive");
      }
    } catch (error) {
      console.error("Error in fetchWebhookInfo:", error);
      setWebhookStatus("error");
      toast.error("Failed to fetch webhook information");
    }
  };

  // Set webhook URL in Telegram API
  const setWebhook = async () => {
    if (!webhookInput) {
      toast.error("Please enter a webhook URL");
      return;
    }

    setIsUpdatingWebhook(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-bot-setup', {
        body: { 
          action: 'setWebhook',
          webhook_url: webhookInput
        }
      });

      if (error) {
        console.error("Error setting webhook:", error);
        toast.error("Failed to set webhook");
        return;
      }

      if (data.ok) {
        toast.success("Webhook set successfully");
        fetchTelegramConfig();
        fetchWebhookInfo();
      } else {
        toast.error(`Failed to set webhook: ${data.description}`);
      }
    } catch (error) {
      console.error("Error in setWebhook:", error);
      toast.error("Failed to set webhook");
    } finally {
      setIsUpdatingWebhook(false);
    }
  };

  // Delete webhook from Telegram API
  const deleteWebhook = async () => {
    if (!confirm("Are you sure you want to delete the webhook?")) {
      return;
    }

    setIsUpdatingWebhook(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-bot-setup', {
        body: { action: 'deleteWebhook' }
      });

      if (error) {
        console.error("Error deleting webhook:", error);
        toast.error("Failed to delete webhook");
        return;
      }

      if (data.ok) {
        toast.success("Webhook deleted successfully");
        setWebhookInput("");
        fetchTelegramConfig();
        fetchWebhookInfo();
      } else {
        toast.error(`Failed to delete webhook: ${data.description}`);
      }
    } catch (error) {
      console.error("Error in deleteWebhook:", error);
      toast.error("Failed to delete webhook");
    } finally {
      setIsUpdatingWebhook(false);
    }
  };

  // Fetch authorized chats from database
  const fetchAuthorizedChats = async () => {
    setIsLoadingChats(true);
    try {
      const { data, error } = await supabase
        .from('telegram_authorized_chats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching authorized chats:", error);
        toast.error("Failed to fetch authorized chats");
        return;
      }

      setAuthorizedChats(data || []);
    } catch (error) {
      console.error("Error in fetchAuthorizedChats:", error);
      toast.error("Failed to fetch authorized chats");
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Add a new authorized chat
  const addAuthorizedChat = async (data: any) => {
    try {
      const { error } = await supabase
        .from('telegram_authorized_chats')
        .insert({
          chat_id: data.chat_id,
          user_name: data.user_name || null,
          notes: data.notes || null,
          is_active: data.is_active,
          authorized_by: "Admin"
        });

      if (error) {
        console.error("Error adding authorized chat:", error);
        toast.error("Failed to add authorized chat");
        return;
      }

      toast.success("Chat authorized successfully");
      fetchAuthorizedChats();
      setIsAddChatDialogOpen(false);
      chatForm.reset();
    } catch (error) {
      console.error("Error in addAuthorizedChat:", error);
      toast.error("Failed to add authorized chat");
    }
  };

  // Toggle chat active status
  const toggleChatStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('telegram_authorized_chats')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) {
        console.error("Error updating chat status:", error);
        toast.error("Failed to update chat status");
        return;
      }

      toast.success(`Chat ${isActive ? 'deactivated' : 'activated'} successfully`);
      fetchAuthorizedChats();
    } catch (error) {
      console.error("Error in toggleChatStatus:", error);
      toast.error("Failed to update chat status");
    }
  };

  // Delete an authorized chat
  const deleteAuthorizedChat = async (id: string) => {
    if (!confirm("Are you sure you want to delete this authorized chat?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('telegram_authorized_chats')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting authorized chat:", error);
        toast.error("Failed to delete authorized chat");
        return;
      }

      toast.success("Chat deleted successfully");
      fetchAuthorizedChats();
    } catch (error) {
      console.error("Error in deleteAuthorizedChat:", error);
      toast.error("Failed to delete authorized chat");
    }
  };

  // Fetch message logs from database
  const fetchMessageLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('telegram_message_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching message logs:", error);
        toast.error("Failed to fetch message logs");
        return;
      }

      setMessageLogs(data || []);
    } catch (error) {
      console.error("Error in fetchMessageLogs:", error);
      toast.error("Failed to fetch message logs");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Send a test message to a chat
  const sendTestMessage = async (chatId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('telegram-send-message', {
        body: {
          chat_id: chatId,
          text: "This is a test message from the Telegram Admin panel.",
          parse_mode: "HTML"
        }
      });

      if (error) {
        console.error("Error sending test message:", error);
        toast.error("Failed to send test message");
        return;
      }

      if (data.success) {
        toast.success("Test message sent successfully");
        fetchMessageLogs();
      } else {
        toast.error(`Failed to send test message: ${data.error}`);
      }
    } catch (error) {
      console.error("Error in sendTestMessage:", error);
      toast.error("Failed to send test message");
    }
  };

  // Get badge color based on webhook status
  const getStatusBadge = () => {
    switch (webhookStatus) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge className="bg-yellow-500">Inactive</Badge>;
      case "error":
        return <Badge className="bg-red-500">Error</Badge>;
      case "loading":
        return <Badge className="bg-blue-500">Loading...</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  // Get badge for message direction
  const getDirectionBadge = (direction: string) => {
    if (direction === "incoming") {
      return <Badge className="bg-blue-500">Incoming</Badge>;
    }
    return <Badge className="bg-green-500">Outgoing</Badge>;
  };

  // Get badge for message status
  const getStatusBadgeForMessage = (status: string) => {
    switch (status) {
      case "processed":
        return <Badge className="bg-green-500">Processed</Badge>;
      case "error":
        return <Badge className="bg-red-500">Error</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Telegram Bot Administration</h1>
      
      <Tabs defaultValue="webhook">
        <TabsList className="mb-6">
          <TabsTrigger value="webhook" className="flex items-center">
            <Webhook className="mr-2 h-4 w-4" />
            Webhook Setup
          </TabsTrigger>
          <TabsTrigger value="authorized-chats" className="flex items-center">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Authorized Chats
          </TabsTrigger>
          <TabsTrigger value="message-logs" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Message Logs
          </TabsTrigger>
        </TabsList>

        {/* Webhook Setup Tab */}
        <TabsContent value="webhook">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Webhook Configuration</span>
                {getStatusBadge()}
              </CardTitle>
              <CardDescription>
                Configure the webhook URL for your Telegram bot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Current Webhook URL</h3>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={webhookInput} 
                      onChange={(e) => setWebhookInput(e.target.value)}
                      placeholder="Enter webhook URL"
                      className="flex-1"
                    />
                    <Button onClick={setWebhook} disabled={isUpdatingWebhook}>
                      {webhookStatus === "active" ? "Update" : "Set"}
                    </Button>
                    {webhookStatus === "active" && (
                      <Button 
                        variant="destructive" 
                        onClick={deleteWebhook}
                        disabled={isUpdatingWebhook}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Use your project's Supabase edge function URL: 
                    <code className="text-xs bg-muted px-1 py-0.5 rounded ml-1">
                      https://klieshkrqryigtqtshka.supabase.co/functions/v1/telegram-webhook-proxy
                    </code>
                  </p>
                </div>

                {config && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Webhook Secret</h3>
                    <div className="flex items-center gap-2">
                      <Input 
                        type={showSecret ? "text" : "password"} 
                        value={config.webhook_secret || ""}
                        readOnly
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => setShowSecret(!showSecret)}
                        size="sm"
                      >
                        {showSecret ? "Hide" : "Show"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      This secret is automatically used when setting up the webhook.
                    </p>
                  </div>
                )}

                {webhookInfo && webhookStatus === "active" && (
                  <div className="rounded border p-4 mt-4">
                    <h3 className="text-sm font-medium mb-2">Webhook Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">URL:</span> {webhookInfo.result.url}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Pending Updates:</span> {webhookInfo.result.pending_update_count}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Max Connections:</span> {webhookInfo.result.max_connections}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">IP Address:</span> {webhookInfo.result.ip_address}
                        </p>
                        {webhookInfo.result.last_error_message && (
                          <p className="text-sm text-red-500">
                            <span className="font-medium">Last Error:</span> {webhookInfo.result.last_error_message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authorized Chats Tab */}
        <TabsContent value="authorized-chats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Authorized Chats</span>
                <Dialog open={isAddChatDialogOpen} onOpenChange={setIsAddChatDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Chat
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Authorized Chat</DialogTitle>
                      <DialogDescription>
                        Add a new chat that will be authorized to interact with the bot.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...chatForm}>
                      <form onSubmit={chatForm.handleSubmit(addAuthorizedChat)} className="space-y-4">
                        <FormField
                          control={chatForm.control}
                          name="chat_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chat ID</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g. 123456789" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={chatForm.control}
                          name="user_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>User Name (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g. John Doe" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={chatForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Any additional notes about this chat" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={chatForm.control}
                          name="is_active"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Active</FormLabel>
                                <FormDescription>
                                  Whether this chat is currently authorized
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit">Add Chat</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Manage chats that are authorized to interact with your bot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingChats ? (
                <div className="flex justify-center p-4">
                  <p>Loading authorized chats...</p>
                </div>
              ) : authorizedChats.length === 0 ? (
                <div className="text-center p-4 border rounded">
                  <p className="text-muted-foreground">No authorized chats found.</p>
                  <p className="text-sm">Click "Add Chat" to authorize a new chat.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chat ID</TableHead>
                      <TableHead>User Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authorizedChats.map((chat) => (
                      <TableRow key={chat.id}>
                        <TableCell className="font-mono">{chat.chat_id}</TableCell>
                        <TableCell>{chat.user_name || "-"}</TableCell>
                        <TableCell>
                          <Badge className={chat.is_active ? "bg-green-500" : "bg-red-500"}>
                            {chat.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {chat.notes || "-"}
                        </TableCell>
                        <TableCell>{formatDate(chat.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => toggleChatStatus(chat.id, chat.is_active)}
                            >
                              {chat.is_active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => sendTestMessage(chat.chat_id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteAuthorizedChat(chat.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Message Logs Tab */}
        <TabsContent value="message-logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Message Logs</span>
                <Button size="sm" onClick={fetchMessageLogs}>Refresh</Button>
              </CardTitle>
              <CardDescription>
                View recent message logs between your bot and Telegram users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="flex justify-center p-4">
                  <p>Loading message logs...</p>
                </div>
              ) : messageLogs.length === 0 ? (
                <div className="text-center p-4 border rounded">
                  <p className="text-muted-foreground">No message logs found.</p>
                </div>
              ) : (
                <div className="rounded border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Chat ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messageLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(log.created_at)}
                          </TableCell>
                          <TableCell className="font-mono">{log.chat_id}</TableCell>
                          <TableCell>{log.message_type}</TableCell>
                          <TableCell>{getDirectionBadge(log.direction)}</TableCell>
                          <TableCell>{getStatusBadgeForMessage(log.processed_status)}</TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            <div className="relative group">
                              <span className="group-hover:invisible">
                                {log.message_text?.substring(0, 50) || "-"}
                                {(log.message_text?.length || 0) > 50 ? "..." : ""}
                              </span>
                              <div className="absolute left-0 top-0 invisible group-hover:visible bg-popover p-2 rounded shadow-lg z-10 max-w-[400px] break-words">
                                {log.message_text || "-"}
                                {log.error_message && (
                                  <div className="mt-2 text-red-500 text-xs">
                                    <strong>Error:</strong> {log.error_message}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Showing the latest 100 message logs. Click Refresh to update.
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TelegramAdmin;
