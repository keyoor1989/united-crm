
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Send, Trash2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";

interface AuthorizedChat {
  id: string;
  chat_id: string;
  user_name: string | null;
  is_active: boolean;
  authorized_by: string | null;
  notes: string | null;
  created_at: string;
}

export const AuthorizedChatsPanel = () => {
  const [authorizedChats, setAuthorizedChats] = useState<AuthorizedChat[]>([]);
  const [isAddChatDialogOpen, setIsAddChatDialogOpen] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  const chatForm = useForm({
    defaultValues: {
      chat_id: "",
      user_name: "",
      notes: "",
      is_active: true
    }
  });

  // Fetch authorized chats on component mount
  useEffect(() => {
    fetchAuthorizedChats();
  }, []);

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
      } else {
        toast.error(`Failed to send test message: ${data.error}`);
      }
    } catch (error) {
      console.error("Error in sendTestMessage:", error);
      toast.error("Failed to send test message");
    }
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
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
  );
};
