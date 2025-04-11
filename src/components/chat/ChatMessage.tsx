
import React from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageProps {
  message: {
    id: string;
    content: string | React.ReactNode;
    sender: "user" | "bot";
    timestamp: Date;
  };
}

const ChatMessage = ({ message }: MessageProps) => {
  const isBot = message.sender === "bot";
  
  return (
    <div className={cn("flex items-start gap-3", isBot ? "" : "justify-end")}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
          <Bot className="h-4 w-4 text-brand-500" />
        </div>
      )}
      
      <div
        className={cn(
          "p-3 rounded-md max-w-[80%]",
          isBot
            ? "bg-muted text-foreground"
            : "bg-brand-500 text-white"
        )}
      >
        {typeof message.content === "string" ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          message.content
        )}
        <div
          className={cn(
            "text-[10px] mt-1",
            isBot ? "text-muted-foreground" : "text-brand-100"
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
      
      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
