
import { useState } from "react";
import { Message } from "../types/chatTypes";
import { toast } from "sonner";

interface UseAIProps {
  claudeApiKey: string;
  openRouterApiKey: string;
  setShowClaudeApiKeyInput: (show: boolean) => void;
  setShowApiKeyInput: (show: boolean) => void;
}

export const useAI = ({ 
  claudeApiKey, 
  openRouterApiKey, 
  setShowClaudeApiKeyInput, 
  setShowApiKeyInput 
}: UseAIProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processClaudeAi = async (userInput: string): Promise<string> => {
    try {
      // Use OpenRouter API to access Claude 3.7
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Command Copilot"
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-7-sonnet-20250219",
          messages: [
            {
              role: "system",
              content: "You are a helpful and intelligent assistant inside a copier dealership ERP. Provide concise, helpful information about printers, copiers, maintenance, and business operations."
            },
            { 
              role: "user", 
              content: userInput 
            }
          ]
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.choices && data.choices[0]) {
        return data.choices[0].message.content;
      } else {
        throw new Error(data.error?.message || "Failed to get Claude AI response");
      }
    } catch (error) {
      console.error("Claude API error:", error);
      const errorMessage = error instanceof Error ? String(error.message) : String(error || "Unknown error");
      throw new Error(`Claude AI error: ${errorMessage}`);
    }
  };

  const processOpenRouterAi = async (userInput: string): Promise<string> => {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openRouterApiKey}`,
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
              content: userInput
            }
          ]
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.choices && data.choices[0]) {
        return data.choices[0].message.content;
      } else {
        throw new Error(data.error?.message || "Failed to get AI response");
      }
    } catch (error) {
      console.error("OpenRouter API error:", error);
      const errorMessage = error instanceof Error ? String(error.message) : String(error || "Unknown error");
      throw new Error(`OpenRouter AI error: ${errorMessage}`);
    }
  };

  const processAIRequest = async (
    userInput: string,
    preferredAiModel: "openrouter" | "claude",
    addMessageToChat: (message: Message) => void
  ) => {
    setIsProcessing(true);
    
    try {
      if (preferredAiModel === "claude" && openRouterApiKey) {
        try {
          const aiResponse = await processClaudeAi(userInput);
          const botMessage: Message = {
            id: `msg-${Date.now()}-bot`,
            content: aiResponse,
            sender: "bot",
            timestamp: new Date(),
            isAiResponse: true,
            aiModel: "claude-3-7"
          };
          addMessageToChat(botMessage);
          return true;
        } catch (error) {
          // Try OpenRouter as fallback if available
          if (openRouterApiKey) {
            try {
              const fallbackResponse = await processOpenRouterAi(userInput);
              const botMessage: Message = {
                id: `msg-${Date.now()}-bot`,
                content: fallbackResponse,
                sender: "bot",
                timestamp: new Date(),
                isAiResponse: true,
                aiModel: "openrouter"
              };
              addMessageToChat(botMessage);
              return true;
            } catch (fallbackError) {
              const errorMessage = fallbackError instanceof Error ? String(fallbackError.message) : String(fallbackError || "Unknown error");
              const botMessage: Message = {
                id: `msg-${Date.now()}-bot`,
                content: `I couldn't process that request through any AI service. Error: ${errorMessage}`,
                sender: "bot",
                timestamp: new Date(),
              };
              addMessageToChat(botMessage);
              return false;
            }
          } else {
            // No fallback available, show Claude error
            const errorMessage = error instanceof Error ? String(error.message) : String(error || "Unknown error");
            const botMessage: Message = {
              id: `msg-${Date.now()}-bot`,
              content: `I couldn't process that request through Claude AI. Error: ${errorMessage}`,
              sender: "bot",
              timestamp: new Date(),
            };
            addMessageToChat(botMessage);
            setShowClaudeApiKeyInput(true);
            return false;
          }
        }
      } else if (preferredAiModel === "openrouter" && openRouterApiKey) {
        // Use OpenRouter
        try {
          const aiResponse = await processOpenRouterAi(userInput);
          const botMessage: Message = {
            id: `msg-${Date.now()}-bot`,
            content: aiResponse,
            sender: "bot",
            timestamp: new Date(),
            isAiResponse: true,
            aiModel: "openrouter"
          };
          addMessageToChat(botMessage);
          return true;
        } catch (error) {
          // Try Claude as fallback if available
          if (openRouterApiKey) {
            try {
              const fallbackResponse = await processClaudeAi(userInput);
              const botMessage: Message = {
                id: `msg-${Date.now()}-bot`,
                content: fallbackResponse,
                sender: "bot",
                timestamp: new Date(),
                isAiResponse: true,
                aiModel: "claude-3-7"
              };
              addMessageToChat(botMessage);
              return true;
            } catch (fallbackError) {
              const errorMessage = fallbackError instanceof Error ? String(fallbackError.message) : String(fallbackError || "Unknown error");
              const botMessage: Message = {
                id: `msg-${Date.now()}-bot`,
                content: `I couldn't process that request through any AI service. Error: ${errorMessage}`,
                sender: "bot",
                timestamp: new Date(),
              };
              addMessageToChat(botMessage);
              return false;
            }
          } else {
            // No fallback available, show OpenRouter error
            const errorMessage = error instanceof Error ? String(error.message) : String(error || "Unknown error");
            const botMessage: Message = {
              id: `msg-${Date.now()}-bot`,
              content: `I couldn't process that request through the OpenRouter AI. Error: ${errorMessage}`,
              sender: "bot",
              timestamp: new Date(),
            };
            addMessageToChat(botMessage);
            setShowApiKeyInput(true);
            return false;
          }
        }
      } else {
        // No API keys available, prompt for API key
        if (!claudeApiKey && !openRouterApiKey) {
          setShowApiKeyInput(true);
          const botMessage: Message = {
            id: `msg-${Date.now()}-bot`,
            content: "Please enter your OpenRouter API key to enable AI responses with Claude 3.7.",
            sender: "bot",
            timestamp: new Date(),
          };
          addMessageToChat(botMessage);
        } else if (!openRouterApiKey) {
          setShowApiKeyInput(true);
          const botMessage: Message = {
            id: `msg-${Date.now()}-bot`,
            content: "Please enter your OpenRouter API key to use Claude 3.7.",
            sender: "bot",
            timestamp: new Date(),
          };
          addMessageToChat(botMessage);
        }
        return false;
      }
    } catch (error) {
      console.error("Error processing AI request:", error);
      const errorMessage = error instanceof Error ? String(error.message) : String(error || "Unknown error");
      const botMessage: Message = {
        id: `msg-${Date.now()}-bot`,
        content: `Sorry, I encountered an error processing your AI request. ${errorMessage}`,
        sender: "bot",
        timestamp: new Date(),
      };
      addMessageToChat(botMessage);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { processAIRequest, isProcessing };
};
