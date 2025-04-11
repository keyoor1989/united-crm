
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Message } from "./types/chatTypes";
import { useCustomers } from "@/hooks/useCustomers";
import MessageList from "./message/MessageList";
import ChatInput from "./input/ChatInput";
import AISelector from "./models/AISelector";
import ApiKeyInput from "./api/ApiKeyInput";
import { useAI } from "./api/useAI";
import { useCommandProcessor } from "./commands/useCommandProcessor";
import "@/components/chat/chat.css";

const CommandCopilotInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Hello! I'm your Command Copilot. Ask me anything or give me commands to help manage your business.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [claudeApiKey, setClaudeApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showClaudeApiKeyInput, setShowClaudeApiKeyInput] = useState(false);
  const [preferredAiModel, setPreferredAiModel] = useState<"openrouter" | "claude">("claude");
  const { customers } = useCustomers();

  // Add message to chat
  const addMessageToChat = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  // Hook for AI processing
  const { processAIRequest, isProcessing: aiProcessing } = useAI({
    claudeApiKey,
    openRouterApiKey: apiKey,
    setShowClaudeApiKeyInput,
    setShowApiKeyInput
  });

  // Hook for command processing
  const { processCommand, isProcessing: commandProcessing } = useCommandProcessor({
    customers,
    addMessageToChat
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    
    addMessageToChat(userMessage);
    setInputValue("");
    
    // Simulate bot typing
    setIsTyping(true);
    
    try {
      // Try to process as a structured command first
      const isCommandHandled = await processCommand(inputValue);
      
      if (!isCommandHandled) {
        // It's not a structured command, try AI processing
        // Check if we have a phone number to enrich with context
        const phoneNumberMatch = inputValue.match(/\b\d{10}\b/);
        let aiPrompt = inputValue;
        
        // If it's a phone number, add customer context if available
        if (phoneNumberMatch) {
          const phoneNumber = phoneNumberMatch[0];
          const customer = customers.find(c => c.phone === phoneNumber);
          if (customer) {
            aiPrompt = `The user is asking about customer: ${JSON.stringify(customer, null, 2)}.\n\nBased on this customer data, ${inputValue}`;
          }
        }
        
        await processAIRequest(
          aiPrompt, 
          preferredAiModel, 
          addMessageToChat
        );
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage = error instanceof Error ? String(error.message) : String(error || "Unknown error");
      const botMessage: Message = {
        id: `msg-${Date.now()}-bot`,
        content: `Sorry, I encountered an error processing your request. ${errorMessage}`,
        sender: "bot",
        timestamp: new Date(),
      };
      
      addMessageToChat(botMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmitApiKey = (type: "openrouter" | "claude") => {
    if (type === "openrouter") {
      if (apiKey.trim()) {
        setShowApiKeyInput(false);
        toast.success("OpenRouter API key saved for this session");
        
        // Add confirmation message
        const botMessage: Message = {
          id: `msg-${Date.now()}-bot`,
          content: "OpenRouter API key saved. I can now respond to your natural language questions as a fallback option!",
          sender: "bot",
          timestamp: new Date(),
        };
        
        addMessageToChat(botMessage);
      } else {
        toast.error("Please enter a valid API key");
      }
    } else if (type === "claude") {
      if (claudeApiKey.trim()) {
        setShowClaudeApiKeyInput(false);
        toast.success("Claude API key saved for this session");
        
        // Add confirmation message
        const botMessage: Message = {
          id: `msg-${Date.now()}-bot`,
          content: "Claude API key saved. I can now respond to your questions with Claude AI!",
          sender: "bot",
          timestamp: new Date(),
        };
        
        addMessageToChat(botMessage);
      } else {
        toast.error("Please enter a valid Claude API key");
      }
    }
  };

  const togglePreferredAi = () => {
    setPreferredAiModel(prev => prev === "claude" ? "openrouter" : "claude");
    toast.success(`Switched preferred AI to ${preferredAiModel === "claude" ? "OpenRouter" : "Claude"}`);
  };

  return (
    <Card className="border-border">
      <CardContent className="p-0 flex flex-col h-[calc(100vh-240px)]">
        <MessageList 
          messages={messages} 
          isTyping={isTyping} 
        />
        
        {showClaudeApiKeyInput && (
          <ApiKeyInput 
            apiKey={claudeApiKey} 
            setApiKey={setClaudeApiKey}
            apiType="claude"
            onSubmit={handleSubmitApiKey}
          />
        )}
        
        {showApiKeyInput && (
          <ApiKeyInput 
            apiKey={apiKey} 
            setApiKey={setApiKey}
            apiType="openrouter"
            onSubmit={handleSubmitApiKey}
          />
        )}
        
        <div className="border-t p-4">
          <AISelector 
            preferredAiModel={preferredAiModel}
            togglePreferredAi={togglePreferredAi}
          />
          <ChatInput 
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSendMessage={handleSendMessage}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CommandCopilotInterface;
