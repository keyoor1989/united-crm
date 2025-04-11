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
  Loader2,
  UserPlus,
  ClipboardList,
  Phone
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
import { parseCustomerCommand, checkDuplicateCustomer, createNewCustomer } from "@/utils/chatCommands/customerParser";
import { parseTaskCommand, createNewTask } from "@/utils/chatCommands/taskParser";
import { parsePhoneNumberCommand, findCustomerByPhone } from "@/utils/chatCommands/customerLookupParser";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerType } from "@/types/customer";
import { Task } from "@/types/task";
import QuotationGenerator from "./QuotationGenerator";
import InventoryResultView from "./InventoryResultView";
import CustomerCreationView from "./CustomerCreationView";
import CustomerLookupView from "./CustomerLookupView";
import TaskCreationView from "./TaskCreationView";
import { Quotation } from "@/types/sales";
import { generateQuotationPdf } from "@/utils/pdfGenerator";

interface Message {
  id: string;
  content: string | React.ReactNode;
  sender: "user" | "bot";
  timestamp: Date;
  isAiResponse?: boolean;
  aiModel?: string;
}

type CommandIntent = 
  | "quotation" 
  | "task" 
  | "inventory" 
  | "invoice" 
  | "report" 
  | "customer"
  | "follow-up"
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
  "Add new customer Ravi Sharma from Bhopal",
  "Create lead: Mahesh Sharma, number 8103449999, interested in Ricoh 2014D",
  "Naya customer Vinay Jain, Indore, 8888000011, spare part enquiry",
  "Add follow-up task for Rahul Mehta tomorrow at 11 AM",
  "Reminder: call Prakash on 15th April at 3PM",
  "Create task to follow up with ABC Corp regarding Kyocera quote",
  "Show open service calls for this week",
  "Schedule a follow-up with ABC Corp next Monday",
  "How many machines are due for service this month?",
  "What is my sales target status for this quarter?",
  "8103349299", // Sample mobile number for testing
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
  const [customerData, setCustomerData] = useState<CustomerType | null>(null);
  const [taskData, setTaskData] = useState<Task | null>(null);
  const [isDuplicateCustomer, setIsDuplicateCustomer] = useState<boolean>(false);
  const { customers } = useCustomers();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const getClaudeApiKey = () => {
    return sessionStorage.getItem("claude_api_key") || "";
  };
  
  const getOpenRouterApiKey = () => {
    return sessionStorage.getItem("openrouter_api_key") || "";
  };

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

  const processClaudeAI = async (prompt: string): Promise<string> => {
    const openRouterApiKey = getOpenRouterApiKey();
    
    if (!openRouterApiKey) {
      throw new Error("OpenRouter API key is not set. Please go to API Settings to add your key.");
    }
    
    try {
      console.log("Calling Claude 3.7 via OpenRouter API");
      
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
              content: prompt 
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenRouter API returned an error:", response.status, errorData);
        throw new Error(`API returned ${response.status}: ${errorData.error?.message || "Unknown error"}`);
      }
      
      const data = await response.json();
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        return data.choices[0].message.content;
      } else {
        console.error("Unexpected OpenRouter API response format:", data);
        throw new Error("Received an unexpected response format from OpenRouter API");
      }
    } catch (error) {
      console.error("Claude API error details:", error);
      
      // Provide more specific error messages based on error type
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error("Failed to connect to OpenRouter API. This could be due to network issues, CORS restrictions, or an invalid API endpoint. Please check your network connection and API settings.");
      }
      
      const errorMessage = error instanceof Error ? String(error.message) : String(error || "Unknown error");
      throw new Error(`Claude AI error: ${errorMessage}`);
    }
  };

  const isMobileNumber = (input: string): boolean => {
    const cleanedInput = input.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleanedInput);
  };

  const getCustomerByMobile = (mobileNumber: string): CustomerType | null => {
    const cleanedNumber = mobileNumber.replace(/\D/g, '');
    
    return customers.find(customer => customer.phone.replace(/\D/g, '') === cleanedNumber) || null;
  };

  const buildCustomerProfilePrompt = (customer: CustomerType): string => {
    const machineDetails = customer.machines.length > 0 ? customer.machines[0] : "No machines";
    
    const amcStatus = customer.status === "Active" ? "Active" : "Inactive";
    const amcRent = "₹" + (Math.floor(Math.random() * 15) + 5) * 1000 + "/month";
    const lastServiceDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString();
    const engineers = ["Mohan", "Ramesh", "Suresh", "Mahesh", "Dinesh"];
    const lastEngineer = engineers[Math.floor(Math.random() * engineers.length)];
    const followUpDate = new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toLocaleDateString();
    const leadSources = ["IndiaMart", "Website", "Referral", "Cold Call", "Exhibition"];
    const leadSource = leadSources[Math.floor(Math.random() * leadSources.length)];
    
    return `
Customer Profile:
- Name: ${customer.name}
- Mobile: ${customer.phone}
- City: ${customer.location}
- Machine: ${machineDetails}
- AMC: ${amcStatus}, Rent ${amcRent}
- Last Service: ${lastServiceDate} by ${lastEngineer}
- Follow-up: ${followUpDate}
- Lead Source: ${leadSource}

Please summarize this in a short and helpful business format.
`;
  };

  const parseCommand = (command: string): CommandIntent => {
    if (isMobileNumber(command)) {
      return "unknown";
    }
    
    const commandLower = command.toLowerCase();
    
    if (commandLower.includes("quotation") || commandLower.includes("quote") || 
        commandLower.match(/quote for|generate quote|create quote|make quotation/)) {
      return "quotation";
    } else if (commandLower.includes("follow-up") || commandLower.includes("follow up") || 
               commandLower.includes("reminder") || commandLower.includes("remind me") ||
               (commandLower.includes("task") && commandLower.includes("follow"))) {
      return "follow-up";
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
    } else if (commandLower.includes("new customer") || commandLower.includes("add customer") || 
               commandLower.includes("create lead") || commandLower.includes("naya customer") ||
               commandLower.includes("add new customer")) {
      return "customer";
    }
    
    return "unknown";
  };

  const handleSendMessage = async () => {
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
    
    try {
      if (isMobileNumber(inputValue)) {
        const customer = getCustomerByMobile(inputValue);
        
        if (customer) {
          const prompt = buildCustomerProfilePrompt(customer);
          
          try {
            const aiResponse = await processClaudeAI(prompt);
            
            const botMessage: Message = {
              id: `msg-${Date.now()}-bot`,
              content: aiResponse,
              sender: "bot",
              timestamp: new Date(),
              isAiResponse: true,
              aiModel: "claude-3-7"
            };
            
            setMessages((prev) => [...prev, botMessage]);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            const botMessage: Message = {
              id: `msg-${Date.now()}-bot`,
              content: `Customer found, but I couldn't process the AI response: ${errorMessage}. Please check your API settings.`,
              sender: "bot",
              timestamp: new Date(),
            };
            
            setMessages((prev) => [...prev, botMessage]);
          }
        } else {
          const botMessage: Message = {
            id: `msg-${Date.now()}-bot`,
            content: "No customer found with this mobile number.",
            sender: "bot",
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, botMessage]);
        }
      } else {
        const intent = parseCommand(inputValue);
        
        if (intent !== "unknown") {
          const response = generateResponse(intent, inputValue);
          
          const botMessage: Message = {
            id: `msg-${Date.now()}-bot`,
            content: response,
            sender: "bot",
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, botMessage]);
          
          if (intent !== "help" && intent !== "quotation") {
            toast.success(`Successfully processed your ${intent} request`);
          }
        } else {
          setIsProcessing(true);
          try {
            console.log("Processing message with Claude 3.7 AI...");
            const aiResponse = await processClaudeAI(inputValue);
            console.log("Claude 3.7 AI response received:", aiResponse ? "Response received" : "No response");
            
            const botMessage: Message = {
              id: `msg-${Date.now()}-bot`,
              content: aiResponse,
              sender: "bot",
              timestamp: new Date(),
              isAiResponse: true,
              aiModel: "claude-3-7"
            };
            
            setMessages((prev) => [...prev, botMessage]);
          } catch (error) {
            console.error("Error processing Claude 3.7 AI request:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            const botMessage: Message = {
              id: `msg-${Date.now()}-bot`,
              content: `I couldn't process your request: ${errorMessage}. Please check your API settings.`,
              sender: "bot",
              timestamp: new Date(),
            };
            
            setMessages((prev) => [...prev, botMessage]);
          } finally {
            setIsProcessing(false);
          }
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      
      const botMessage: Message = {
        id: `msg-${Date.now()}-bot`,
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}`,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
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
      
      case "follow-up":
        const parsedTask = parseTaskCommand(command);
        
        if (!parsedTask.isValid) {
          return (
            <div className="space-y-3">
              <p>I'd be happy to create a follow-up task for you. Please provide the following missing information:</p>
              <ul className="list-disc pl-5 space-y-1">
                {parsedTask.missingFields.includes("customerName") && (
                  <li>Who do you need to follow up with?</li>
                )}
                {parsedTask.missingFields.includes("dueDate") && (
                  <li>When should the follow-up be scheduled?</li>
                )}
                {!parsedTask.taskTitle && (
                  <li>What's the purpose of this follow-up? (optional)</li>
                )}
              </ul>
              <p>For example: "Add follow-up task for Rahul Mehta tomorrow at 11 AM" or "Reminder: call Prakash on 15th April at 3PM"</p>
            </div>
          );
        }
        
        const newTask = createNewTask(parsedTask);
        setTaskData(newTask);
        
        return (
          <TaskCreationView task={newTask} />
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
      
      case "customer":
        const parsedCustomer = parseCustomerCommand(command);
        
        if (!parsedCustomer.isValid) {
          return (
            <div className="space-y-3">
              <p>I'd be happy to add a new customer. Please provide the following missing information:</p>
              <ul className="list-disc pl-5 space-y-1">
                {parsedCustomer.missingFields.includes("name") && (
                  <li>What is the customer's name?</li>
                )}
                {parsedCustomer.missingFields.includes("phone") && (
                  <li>What is the customer's phone number?</li>
                )}
                {parsedCustomer.missingFields.includes("location") && (
                  <li>Which city/location is the customer from?</li>
                )}
                {!parsedCustomer.product && (
                  <li>Is the customer interested in any specific product? (optional)</li>
                )}
              </ul>
              <p>For example: "Add new customer Ravi Sharma from Bhopal, 9876543210, interested in Kyocera 2554ci"</p>
            </div>
          );
        }
        
        const duplicateCustomer = checkDuplicateCustomer(parsedCustomer.phone, customers);
        
        if (duplicateCustomer) {
          setCustomerData(duplicateCustomer);
          setIsDuplicateCustomer(true);
          
          return (
            <CustomerCreationView 
              customer={duplicateCustomer} 
              isDuplicate={true} 
              duplicateCustomer={duplicateCustomer} 
            />
          );
        }
        
        const newCustomer = createNewCustomer(parsedCustomer);
        setCustomerData(newCustomer);
        setIsDuplicateCustomer(false);
        
        return (
          <CustomerCreationView customer={newCustomer} />
        );
      
      case "help":
        return (
          <div className="space-y-3">
            <p>Here are some things you can ask me to do:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create quotations (e.g., "Send quotation for Kyocera 2554ci to Mr. Rajesh")</li>
              <li>Schedule tasks (e.g., "Create a task for Ravi engineer for tomorrow at 10 AM")</li>
              <li>Add follow-ups (e.g., "Add follow-up task for Rahul Mehta tomorrow at 11 AM")</li>
              <li>Check inventory (e.g., "Check inventory for Ricoh 2014 toner" or "Kitna stock hai Sharp MX3070 ka?")</li>
              <li>Add customers (e.g., "Add new customer Ravi Sharma from Bhopal" or "Create lead: Mahesh Sharma, number 8103449999")</li>
              <li>Generate invoices (e.g., "Generate AMC invoice for Gufic Bio for April 2025")</li>
              <li>Show reports (e.g., "Show open service calls for this week")</li>
            </ul>
            <p>You can also use the quick action buttons above to quickly access common functions.</p>
          </div>
        );
      
      default:
        return "I'm not sure how to help with that. Try asking about quotations, tasks, inventory, customers, or reports.";
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
      case "customer":
        command = "Add new customer ";
        break;
      case "task":
        command = "Create a task for ";
        break;
      case "follow-up":
        command = "Add follow-up for ";
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
                  onClick={() => handleQuickAction("customer")}
                  className="shrink-0"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Customer</TooltipContent>
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
                  onClick={() => handleQuickAction("follow-up")}
                  className="shrink-0"
                >
                  <ClipboardList className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Follow-up</TooltipContent>
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
          
          <div className="relative flex-1">
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute bottom-full left-0 w-full bg-background border rounded-md shadow-md mb-1 z-10 max-h-[200px] overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="p-2 hover:bg-accent cursor-pointer text-sm"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
            
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message or prompt..."
              className="min-h-[60px] resize-none flex-1"
            />
          </div>
          
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleAttachment}
                    className="shrink-0"
                  >
                    <PaperclipIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach File</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleSendMessage}
                    size="icon" 
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send Message</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedChatInterface;
