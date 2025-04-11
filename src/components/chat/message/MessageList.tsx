
import React, { useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import EnhancedChatMessage from "../EnhancedChatMessage";
import { Message } from "../types/chatTypes";

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

const MessageList = ({ messages, isTyping }: MessageListProps) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages appear
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id}>
          <EnhancedChatMessage 
            message={message} 
          />
          {message.isAiResponse && message.sender === "bot" && (
            <div className="flex items-center ml-10 mt-1 text-xs text-muted-foreground">
              {message.aiModel === "claude" ? (
                <>
                  <span className="h-3 w-3 mr-1">✨</span> Powered by Claude AI
                </>
              ) : (
                <>
                  <span className="h-3 w-3 mr-1">✨</span> Powered by AI
                </>
              )}
            </div>
          )}
        </div>
      ))}
      
      {isTyping && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-center space-x-1 bg-muted p-3 rounded-md max-w-[80%]">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        </div>
      )}
      
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;
