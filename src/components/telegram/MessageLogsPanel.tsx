
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

export const MessageLogsPanel = () => {
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  // Fetch message logs on component mount
  useEffect(() => {
    fetchMessageLogs();
  }, []);

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
  );
};
