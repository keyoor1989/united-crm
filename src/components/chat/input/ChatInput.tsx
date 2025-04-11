
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, PaperclipIcon } from "lucide-react";
import { toast } from "sonner";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => void;
}

const ChatInput = ({ inputValue, setInputValue, handleSendMessage }: ChatInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachment = () => {
    toast.info("File upload functionality coming soon!");
  };

  return (
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
  );
};

export default ChatInput;
