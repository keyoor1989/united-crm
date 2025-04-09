
import React from "react";
import Layout from "@/components/layout/Layout";
import ChatInterface from "@/components/chat/ChatInterface";

const Chat = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bot Assistant</h1>
            <p className="text-muted-foreground">
              Get help with your daily tasks, queries, and business information.
            </p>
          </div>
        </div>

        <ChatInterface />
      </div>
    </Layout>
  );
};

export default Chat;
