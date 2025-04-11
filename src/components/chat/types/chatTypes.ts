
import React from "react";

export interface Message {
  id: string;
  content: string | React.ReactNode;
  sender: "user" | "bot";
  timestamp: Date;
  isAiResponse?: boolean;
  aiModel?: "openrouter" | "claude" | "claude-3-7";
}
