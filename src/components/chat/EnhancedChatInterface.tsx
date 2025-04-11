import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Bot, 
  User, 
  PaperclipIcon, 
  FileText, 
  Package, 
  ListChecks, 
  BarChart4,
  HelpCircle,
  FileDown,
  Loader2
} from "lucide-react";
import EnhancedChatMessage from "./EnhancedChatMessage";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { parseQuotationCommand, ParsedQuotationRequest } from "@/utils/chatCommands/quotationParser";
import { parseInventoryCommand, ParsedInventoryQuery } from "@/utils/chatCommands/inventoryParser";
import QuotationGenerator from "./QuotationGenerator";
import InventoryResultView from "./InventoryResultView";
import { Quotation } from "@/types/sales";
import { generateQuotationPdf } from "@/utils/pdfGenerator";

interface Message {
  id: string;
  content: string | React.ReactNode;
  sender: "user" | "bot";
  timestamp: Date;
}

type CommandIntent = 
  | "quotation" 
  | "task" 
  | "inventory" 
  | "invoice" 
  | "report" 
  | "help" 
  | "unknown";

const suggestions = [
  "Send quotation for Kyocera 2554ci to Mr. Rajesh",
  "Generate quotation for 3 machines: Kyocera 2554ci, Canon IR2525, HP LaserJet",
  "Create a task for Ravi engineer for tomorrow at 10 AM",
  "Check inventory for Ricoh 2014 toner",
  "Check stock for Kyocera 2554ci drum",
  "Kitna stock hai Sharp MX3070 developer ka?",
  "Generate AMC invoice for Gufic Bio for April 2025",
  "Show open service calls for this week",
  "Schedule a follow-up with ABC Corp next Monday",
  "How many machines are due for service this month?",
  "What is my sales target status for this quarter?",
];

const EnhancedChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Hello! I'm your Smart Assistant. How can I help you today? You can ask me to create quotations, check inventory, create tasks, or generate reports.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [quotationData, setQuotationData] = useState<ParsedQuotationRequest | null>(null);
  const [currentQuotation, setCurrentQuotation] = useState<Quotation | null>(null);
  const [inventoryData, setInventoryData] = useState<ParsedInventoryQuery | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (inputValue.length > 2) {
      const filtered = suggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue]);

  const parseCommand = (command: string): CommandIntent => {
    const commandLower = command.toLowerCase();
    
    if (commandLower.includes("quotation") || commandLower.includes("quote") || 
        commandLower.match(/quote for|generate quote|create quote|make quotation/)) {
      return "quotation";
    } else if (commandLower.includes("task") || commandLower.includes("schedule")) {
      return "task";
    } else if (commandLower.includes("inventory") || commandLower.includes("stock") || 
              commandLower.includes("kitna stock") || commandLower.includes("check stock") ||
              commandLower.includes("toner") || commandLower.includes("drum") || 
              commandLower.includes("developer")) {
      return "inventory";
    } else if (commandLower.includes("invoice") || commandLower.includes("bill")) {
      return "invoice";
    } else if (commandLower.includes("report") || commandLower.includes("show") || commandLower.includes("how many")) {
      return "report";
    } else if (commandLower.includes("help") || commandLower.includes("what can you do")) {
      return "help";
    }
    
    return "unknown";
  };

  const generateResponse = (intent: CommandIntent, command: string): React.ReactNode => {
    switch (intent) {
      case "quotation":
        const parsedQuote = parseQuotationCommand(command);
        
        if (parsedQuote.models.length === 0) {
          return (
            <div className="space-y-3">
              <p>I'd be happy to create a quotation for you. Please provide more details:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Which machine model(s) do you need a quotation for?</li>
                <li>Who is the customer?</li>
                <li>How many units of each model?</li>
              </ul>
              <p>For example: "Generate quotation for 2 Kyocera 2554ci for ABC Company"</p>
            </div>
          );
        }
        
        setQuotationData(parsedQuote);
        
        return (
          <div className="space-y-3">
            <p>I'll create a quotation based on your request. Let's fill in the details:</p>
            <QuotationGenerator 
              initialData={parsedQuote}
              onComplete={(quotation) => {
                setCurrentQuotation(quotation);
                setQuotationData(null);
                
                const successMsg: Message = {
                  id: `msg-${Date.now()}-bot-success`,
                  content: (
                    <div className="space-y-3">
                      <p>Quotation created successfully! Here's a summary:</p>
                      <div className="bg-muted p-3 rounded-md text-sm">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Quotation #{quotation.quotationNumber}</span>
                          <Badge variant="outline">Draft</Badge>
                        </div>
                        <p><strong>Customer:</strong> {quotation.customerName}</p>
                        <p><strong>Items:</strong> {quotation.items.length}</p>
                        <p><strong>Total Amount:</strong> ₹{quotation.grandTotal.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-2"
                          onClick={() => {
                            try {
                              generateQuotationPdf(quotation);
                              toast.success("PDF downloaded successfully");
                            } catch (error) {
                              toast.error("Error generating PDF");
                            }
                          }}
                        >
                          <FileDown className="h-4 w-4" />
                          Download PDF
                        </Button>
                        <Button size="sm">View Full Quotation</Button>
                      </div>
                    </div>
                  ),
                  sender: "bot",
                  timestamp: new Date(),
                };
                
                setMessages(prev => [...prev, successMsg]);
              }}
              onCancel={() => {
                setQuotationData(null);
                
                const cancelMsg: Message = {
                  id: `msg-${Date.now()}-bot-cancel`,
                  content: "Quotation creation cancelled. Let me know if you'd like to try again or if there's something else I can help you with.",
                  sender: "bot",
                  timestamp: new Date(),
                };
                
                setMessages(prev => [...prev, cancelMsg]);
              }}
            />
          </div>
        );
      
      case "task":
        return (
          <div className="space-y-3">
            <p>I've created a task based on your request:</p>
            <div className="bg-muted p-3 rounded-md text-sm">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Task #T-2025-108</span>
                <Badge variant="outline">Assigned</Badge>
              </div>
              <p><strong>Assigned To:</strong> Ravi (Engineer)</p>
              <p><strong>Due Date:</strong> Tomorrow at 10:00 AM</p>
              <p><strong>Priority:</strong> Medium</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm">View Task Details</Button>
            </div>
          </div>
        );
      
      case "inventory":
        const parsedInventory = parseInventoryCommand(command);
        
        if (parsedInventory.matchedItems.length === 0 && 
            !parsedInventory.brand && !parsedInventory.model && !parsedInventory.itemType) {
          return (
            <div className="space-y-3">
              <p>I'd be happy to check inventory for you. Please provide more details:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Which brand or model are you looking for?</li>
                <li>What type of item? (toner, drum, developer, etc.)</li>
              </ul>
              <p>For example: "Check stock for Ricoh 2014 toner" or "Kitna stock hai Kyocera 2554ci ka?"</p>
            </div>
          );
        }
        
        setInventoryData(parsedInventory);
        
        return (
          <InventoryResultView queryResult={parsedInventory} />
        );
      
      case "invoice":
        const clientMatch = command.match(/for\s+([A-Za-z0-9\s]+)(?:\s+for)/i);
        const monthMatch = command.match(/for\s+([A-Za-z]+\s+\d{4})/i);
        const client = clientMatch ? clientMatch[1] : "the client";
        const month = monthMatch ? monthMatch[1] : "the specified period";
        
        return (
          <div className="space-y-3">
            <p>I've generated the AMC invoice for {client} for {month}:</p>
            <div className="bg-muted p-3 rounded-md text-sm">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Invoice #INV-AMC-2025-031</span>
                <Badge variant="outline">Generated</Badge>
              </div>
              <p><strong>Client:</strong> {client}</p>
              <p><strong>Period:</strong> {month}</p>
              <p><strong>Amount:</strong> ₹18,500 + GST</p>
              <p><strong>Due Date:</strong> {new Date(new Date().setDate(new Date().getDate() + 15)).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                Download Invoice
              </Button>
              <Button size="sm">Send to Client</Button>
            </div>
          </div>
        );
      
      case "report":
        return (
          <div className="space-y-3">
            <p>Here's the report you requested:</p>
            <div className="bg-muted p-3 rounded-md text-sm">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Service Calls - This Week</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Call ID</th>
                    <th className="text-left pb-2">Customer</th>
                    <th className="text-left pb-2">Machine</th>
                    <th className="text-right pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">SC-00124</td>
                    <td>City Hospital</td>
                    <td>Kyocera 3554ci</td>
                    <td className="text-right"><Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Completed</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2">SC-00125</td>
                    <td>ABC Enterprises</td>
                    <td>Ricoh MP2014</td>
                    <td className="text-right"><Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">In Progress</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2">SC-00126</td>
                    <td>Sunshine School</td>
                    <td>Sharp MX-3071</td>
                    <td className="text-right"><Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Pending</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex gap-2">
              <Button size="sm">View Detailed Report</Button>
            </div>
          </div>
        );
      
      case "help":
        return (
          <div className="space-y-3">
            <p>Here are some things you can ask me to do:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create quotations (e.g., "Send quotation for Kyocera 2554ci to Mr. Rajesh")</li>
              <li>Schedule tasks (e.g., "Create a task for Ravi engineer for tomorrow at 10 AM")</li>
              <li>Check inventory (e.g., "Check inventory for Ricoh 2014 toner" or "Kitna stock hai Sharp MX3070 ka?")</li>
              <li>Generate invoices (e.g., "Generate AMC invoice for Gufic Bio for April 2025")</li>
              <li>Show reports (e.g., "Show open service calls for this week")</li>
            </ul>
            <p>You can also use the quick action buttons above to quickly access common functions.</p>
          </div>
        );
      
      default:
        return "I'm not sure how to help with that. Try asking about quotations, tasks, inventory, or reports.";
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setShowSuggestions(false);
    
    setIsTyping(true);
    
    const intent = parseCommand(inputValue);
    const response = generateResponse(intent, inputValue);
    
    setTimeout(() => {
      const botMessage: Message = {
        id: `msg-${Date.now()}-bot`,
        content: response,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      
      if (intent !== "unknown" && intent !== "help" && intent !== "quotation") {
        toast.success(`Successfully processed your ${intent} request`);
      }
    }, 1000);
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

  const selectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleQuickAction = (action: string) => {
    let command = "";
    switch (action) {
      case "quotation":
        command = "Create quotation for ";
        break;
      case "inventory":
        command = "Check inventory for ";
        break;
      case "task":
        command = "Create a task for ";
        break;
      case "report":
        command = "Show report for ";
        break;
    }
    
    setInputValue(command);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Card className="border-border">
      <CardContent className="p-0 flex flex-col h-[calc(100vh-350px)]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <EnhancedChatMessage key={message.id} message={message} />
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
          
          {isProcessing && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-2 bg-muted p-3 rounded-md max-w-[80%]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p>Processing your request...</p>
              </div>
            </div>
          )}
          
          <div ref={endOfMessagesRef} />
        </div>
        
        <Separator />
        
        <div className="p-3 flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleQuickAction("quotation")}
                  className="shrink-0"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create Quotation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleQuickAction("inventory")}
                  className="shrink-0"
                >
                  <Package className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Check Inventory</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleQuickAction("task")}
                  className="shrink-0"
                >
                  <ListChecks className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create Task</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleQuickAction("report")}
                  className="shrink-0"
                >
                  <BarChart4 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Reports</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
            <PopoverTrigger asChild>
              <div className="relative flex-1">
                <Textarea
                  ref={inputRef}
                  placeholder="Type your message or command..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[60px] resize-none"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <div className="max-h-[200px] overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-muted cursor-pointer"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleAttachment}
            className="shrink-0"
          >
            <PaperclipIcon className="h-4 w-4" />
          </Button>
          
          <Button onClick={handleSendMessage} className="shrink-0">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedChatInterface;
