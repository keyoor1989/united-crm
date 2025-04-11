
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, PaperclipIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import EnhancedChatMessage from "./EnhancedChatMessage";
import { parseCustomerCommand, createNewCustomer, ParsedCustomerCommand } from "@/utils/chatCommands/customerParser";
import { parsePhoneNumberCommand, findCustomerByPhone } from "@/utils/chatCommands/customerLookupParser";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerType } from "@/types/customer";
import CustomerLookupView from "./CustomerLookupView";
import CustomerCreationView from "./CustomerCreationView";
import { parseTaskCommand, formatTaskTime } from "@/utils/chatCommands/taskParser";
import TaskCreationView from "./TaskCreationView";
import { parseInventoryCommand } from "@/utils/chatCommands/inventoryParser";
import InventoryResultView from "./InventoryResultView";
import { parseQuotationCommand } from "@/utils/chatCommands/quotationParser";
import QuotationGenerator from "./QuotationGenerator";
import "@/components/chat/chat.css";

// Define message type
interface Message {
  id: string;
  content: string | React.ReactNode;
  sender: "user" | "bot";
  timestamp: Date;
  isAiResponse?: boolean;
}

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
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const { customers } = useCustomers();

  // Auto-scroll to the bottom when new messages appear
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const processStructuredCommand = async (message: string): Promise<{handled: boolean, response?: React.ReactNode}> => {
    // Check for phone number lookup command
    const phoneNumber = parsePhoneNumberCommand(message);
    if (phoneNumber) {
      const customer = findCustomerByPhone(phoneNumber, customers);
      if (customer) {
        return {
          handled: true,
          response: <CustomerLookupView customer={customer} />
        };
      } else {
        return {
          handled: true,
          response: `❌ No customer found with the number ${phoneNumber}`
        };
      }
    }

    // Check for customer creation command
    const parsedCustomer = parseCustomerCommand(message);
    if (parsedCustomer.isValid) {
      // Check for duplicate customer
      const existingCustomer = customers.find(
        (c) => c.phone === parsedCustomer.phone
      );

      if (existingCustomer) {
        return {
          handled: true,
          response: `⚠️ Customer with phone ${parsedCustomer.phone} already exists as "${existingCustomer.name}"`
        };
      }

      const newCustomer = createNewCustomer(parsedCustomer);
      return {
        handled: true,
        response: <CustomerCreationView customer={newCustomer} />
      };
    }

    // Check for task creation command
    const taskResult = parseTaskCommand(message);
    if (taskResult.isValid) {
      return {
        handled: true,
        response: <TaskCreationView task={taskResult.task} />
      };
    }

    // Check for inventory command
    const inventoryResult = parseInventoryCommand(message);
    if (inventoryResult.matchedItems.length > 0 || 
        (message.toLowerCase().includes("inventory") || 
         message.toLowerCase().includes("stock"))) {
      return {
        handled: true,
        response: <InventoryResultView result={inventoryResult} />
      };
    }

    // Check for quotation command
    const quotationResult = parseQuotationCommand(message);
    if (quotationResult.isValid) {
      return {
        handled: true,
        response: <QuotationGenerator data={quotationResult} />
      };
    }

    // No structured command matched
    return { handled: false };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    
    // Simulate bot typing
    setIsTyping(true);
    
    try {
      // First check if it's a structured command
      const commandResult = await processStructuredCommand(userMessage.content);
      
      if (commandResult.handled) {
        // It's a structured command, show the result
        const botMessage: Message = {
          id: `msg-${Date.now()}-bot`,
          content: commandResult.response || "Command processed successfully",
          sender: "bot",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, botMessage]);
      } else {
        // It's not a structured command, use OpenRouter API
        if (!apiKey) {
          setShowApiKeyInput(true);
          const botMessage: Message = {
            id: `msg-${Date.now()}-bot`,
            content: "Please enter your OpenRouter API key to enable AI responses.",
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          // Attempt to use OpenRouter API
          try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": window.location.origin,
                "X-Title": "Command Copilot"
              },
              body: JSON.stringify({
                model: "mistral/mistral-7b-instruct", // or "gpt-3.5-turbo" as fallback
                messages: [
                  {
                    role: "system",
                    content: "You are Command Copilot, a business assistant for a copier and printer service company. Answer questions helpfully and concisely."
                  },
                  {
                    role: "user",
                    content: userMessage.content
                  }
                ]
              })
            });
            
            const data = await response.json();
            
            if (response.ok && data.choices && data.choices[0]) {
              const botMessage: Message = {
                id: `msg-${Date.now()}-bot`,
                content: data.choices[0].message.content,
                sender: "bot",
                timestamp: new Date(),
                isAiResponse: true
              };
              
              setMessages((prev) => [...prev, botMessage]);
            } else {
              throw new Error(data.error?.message || "Failed to get AI response");
            }
          } catch (error) {
            console.error("OpenRouter API error:", error);
            const botMessage: Message = {
              id: `msg-${Date.now()}-bot`,
              content: `I couldn't process that request through AI. Error: ${error instanceof Error ? error.message : "Unknown error"}`,
              sender: "bot",
              timestamp: new Date(),
            };
            
            setMessages((prev) => [...prev, botMessage]);
          }
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const botMessage: Message = {
        id: `msg-${Date.now()}-bot`,
        content: "Sorry, I encountered an error processing your request.",
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachment = () => {
    toast.info("File upload functionality coming soon!");
  };

  const handleSubmitApiKey = () => {
    if (apiKey.trim()) {
      setShowApiKeyInput(false);
      toast.success("API key saved for this session");
      
      // Add confirmation message
      const botMessage: Message = {
        id: `msg-${Date.now()}-bot`,
        content: "API key saved. I can now respond to your natural language questions!",
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } else {
      toast.error("Please enter a valid API key");
    }
  };

  return (
    <Card className="border-border">
      <CardContent className="p-0 flex flex-col h-[calc(100vh-240px)]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <EnhancedChatMessage 
                message={message} 
              />
              {message.isAiResponse && message.sender === "bot" && (
                <div className="flex items-center ml-10 mt-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 mr-1" /> Powered by AI
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
          
          {showApiKeyInput && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted p-3 rounded-md max-w-[80%]">
                <p className="mb-2">Please enter your OpenRouter API key:</p>
                <div className="flex gap-2">
                  <Input 
                    type="password" 
                    value={apiKey} 
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk_or_..."
                    className="flex-1"
                  />
                  <Button onClick={handleSubmitApiKey}>Save</Button>
                </div>
                <p className="text-xs mt-2 text-muted-foreground">
                  Your API key is stored only in this browser session.
                </p>
              </div>
            </div>
          )}
          
          <div ref={endOfMessagesRef} />
        </div>
        
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleAttachment}
              className="shrink-0"
            >
              <PaperclipIcon className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message or command..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} className="shrink-0">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommandCopilotInterface;
