
import React from "react";
import { Route } from "react-router-dom";
import TaskEnabledLayout from "@/components/layout/TaskEnabledLayout";
import Chat from "@/pages/Chat";
import ChatAssistant from "@/pages/ChatAssistant";
import SmartAssistant from "@/pages/SmartAssistant";
import TelegramAdmin from "@/pages/TelegramAdmin";

export const CommunicationRoutes = () => {
  return (
    <>
      <Route
        path="chat"
        element={
          <TaskEnabledLayout>
            <Chat />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="chat-assistant"
        element={
          <TaskEnabledLayout>
            <ChatAssistant />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="smart-assistant"
        element={
          <TaskEnabledLayout>
            <SmartAssistant />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="telegram-admin"
        element={
          <TaskEnabledLayout>
            <TelegramAdmin />
          </TaskEnabledLayout>
        }
      />
    </>
  );
};
