
import React from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageProps {
  message: {
    id: string;
    content: string | React.ReactNode;
    sender: "user" | "bot";
    timestamp: Date;
    isAiResponse?: boolean;
    aiModel?: string;
  };
}

const EnhancedChatMessage = ({ message }: MessageProps) => {
  const isBot = message.sender === "bot";
  const isClaudeResponse = isBot && message.isAiResponse && 
                          (message.aiModel === "claude" || message.aiModel === "claude-3-7");
  
  return (
    <div className={cn("flex items-start gap-3", isBot ? "" : "justify-end")}>
      {isBot && (
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          isClaudeResponse ? "bg-purple-100" : "bg-primary/10"
        )}>
          <Bot className={cn(
            "h-4 w-4", 
            isClaudeResponse ? "text-purple-500" : "text-primary"
          )} />
        </div>
      )}
      
      <div
        className={cn(
          "p-3 rounded-md max-w-[80%]",
          isBot
            ? "bg-muted text-foreground"
            : "bg-primary text-primary-foreground",
          isClaudeResponse && "border-l-4 border-purple-400" // Add a purple accent for Claude responses
        )}
      >
        {isClaudeResponse && (
          <div className="text-xs text-purple-500 font-medium mb-1 flex items-center">
            <span>Claude 3.7</span>
            <span className="ml-1">🤖</span>
          </div>
        )}
        
        {typeof message.content === "string" ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          message.content
        )}
        
        <div
          className={cn(
            "text-[10px] mt-1",
            isBot ? "text-muted-foreground" : "text-primary-foreground/70"
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
      
      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
};

export default EnhancedChatMessage;
