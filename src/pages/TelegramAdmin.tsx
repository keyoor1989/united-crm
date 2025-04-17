
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TelegramProvider } from "@/contexts/TelegramContext";
import { WebhookSetupCard } from "@/components/telegram/WebhookSetupCard";
import { Webhook, ShieldCheck, MessageSquare } from "lucide-react";
import { AuthorizedChatsPanel } from "@/components/telegram/AuthorizedChatsPanel";
import { MessageLogsPanel } from "@/components/telegram/MessageLogsPanel";

const TelegramAdmin = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Telegram Bot Administration</h1>
      
      <TelegramProvider>
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
            <WebhookSetupCard />
          </TabsContent>

          {/* Authorized Chats Tab */}
          <TabsContent value="authorized-chats">
            <AuthorizedChatsPanel />
          </TabsContent>

          {/* Message Logs Tab */}
          <TabsContent value="message-logs">
            <MessageLogsPanel />
          </TabsContent>
        </Tabs>
      </TelegramProvider>
    </div>
  );
};

export default TelegramAdmin;
