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
import { supabase } from "@/integrations/supabase/client";
import { products } from "@/data/salesData";

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
    try {
      console.log("Calling Claude 3 via Supabase Edge Function");
      
      const { data, error } = await supabase.functions.invoke('claude-assistant', {
        body: {
          prompt: prompt,
          systemPrompt: "You are a helpful and intelligent assistant inside a copier dealership ERP. Provide concise, helpful information about printers, copiers, maintenance, and business operations."
        }
      });
      
      if (error) {
        console.error("Error calling Claude Edge Function:", error);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (data?.content) {
        console.log("Claude response received successfully");
        return data.content;
      } else {
        console.error("Unexpected Claude response format:", data);
        throw new Error("Unexpected response format from Claude AI");
      }
    } catch (error) {
      console.error("Claude API error details:", error);
      
      // Provide more specific error messages based on error type
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error("Failed to connect to Claude API via Supabase. This could be due to network issues or an invalid API configuration.");
      }
      
      const errorMessage = error instanceof Error ? String(error.message) : String(error || "Unknown error");
      throw new Error(`Claude AI error: ${errorMessage}`);
    }
  };

  const isMobileNumber = (input: string): boolean => {
    const cleanedInput = input.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleanedInput);
  };

  const getCustomerFromSupabase = async (mobileNumber: string): Promise<CustomerType | null> => {
    try {
      const cleanedNumber = mobileNumber.replace(/\D/g, '');
      
      console.log("Fetching customer from Supabase with phone:", cleanedNumber);
      
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id, name, phone, email, area, 
          lead_status, last_contact, 
          customer_machines(machine_name, machine_type, machine_serial, last_service)
        `)
        .eq('phone', cleanedNumber)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching customer:", error);
        throw error;
      }
      
      if (!data) {
        console.log("No customer found with this mobile number");
        return null;
      }
      
      console.log("Customer found:", data);
      
      const customer: CustomerType = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email || "",
        location: data.area,
        lastContact: data.last_contact ? new Date(data.last_contact).toLocaleDateString() : "Never",
        machines: data.customer_machines ? data.customer_machines.map((m: any) => m.machine_name).filter(Boolean) : [],
        status: mapLeadStatusToCustomerStatus(data.lead_status),
        machineDetails: data.customer_machines || []
      };
      
      return customer;
    } catch (error) {
      console.error("Error in getCustomerFromSupabase:", error);
      return null;
    }
  };

  const mapLeadStatusToCustomerStatus = (leadStatus: string): CustomerType["status"] => {
    switch (leadStatus) {
      case "Converted":
        return "Active";
      case "Lost":
        return "Inactive";
      case "New":
      case "Quoted":
        return "Prospect";
      case "Follow-up":
        return "Contract Renewal";
      default:
        return "Active";
    }
  };

  const buildCustomerProfilePrompt = async (customer: CustomerType): Promise<string> => {
    const machineDetails = customer.machineDetails && customer.machineDetails.length > 0 
      ? customer.machineDetails.map((machine: any) => 
          `${machine.machine_name} (${machine.machine_type || "Unknown type"})` +
          `${machine.machine_serial ? ", S/N: " + machine.machine_serial : ""}` +
          `${machine.last_service ? ", Last Service: " + machine.last_service : ""}`
        ).join("\n  - ")
      : customer.machines.length > 0 
        ? customer.machines.join(", ") 
        : "No machines";
    
    const amcStatus = customer.status || "Unknown";
    
    const recentFollowups = await getCustomerFollowups(customer.id);
    const followupText = recentFollowups.length > 0 
      ? recentFollowups.map(f => 
          `- ${new Date(f.date).toLocaleDateString()}: ${f.notes} (${f.status})`
        ).join("\n") 
      : "No recent followups";
    
    return `
Customer Profile:
- Name: ${customer.name}
- Mobile: ${customer.phone}
- Email: ${customer.email || "Not provided"}
- City: ${customer.location}
- Status: ${amcStatus}
- Last Contact: ${customer.lastContact}

Equipment:
  - ${machineDetails}

Recent Followups:
${followupText}

Please summarize this customer profile in a concise, professional format. Focus on key information like status, equipment, and follow-up history that would be immediately useful to a service representative. Keep the tone professional and business-like.
`;
  };

  const getCustomerFollowups = async (customerId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('sales_followups')
        .select('*')
        .eq('customer_id', customerId)
        .order('date', { ascending: false })
        .limit(3);
        
      if (error) {
        console.error("Error fetching followups:", error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in getCustomerFollowups:", error);
      return [];
    }
  };

  const parseCommand = (command: string): CommandIntent => {
    console.log("Parsing command:", command);
    
    if (isMobileNumber(command)) {
      console.log("Detected mobile number format");
      return "unknown";
    }
    
    const commandLower = command.toLowerCase();
    console.log("Command lowercase:", commandLower);
    
    if (commandLower.includes("quotation") || commandLower.includes("quote") || 
        commandLower.match(/quote for|generate quote|create quote|make quotation/)) {
      console.log("Detected quotation command");
      return "quotation";
    } else if (commandLower.includes("follow-up") || commandLower.includes("follow up") || 
               commandLower.includes("reminder") || commandLower.includes("remind me") ||
               (commandLower.includes("task") && commandLower.includes("follow"))) {
      console.log("Detected follow-up command");
      return "follow-up";
    } else if (commandLower.includes("task") || commandLower.includes("schedule")) {
      console.log("Detected task command");
      return "task";
    } else if (commandLower.includes("inventory") || commandLower.includes("stock") || 
              commandLower.includes("kitna stock") || commandLower.includes("check stock") ||
              commandLower.includes("toner") || commandLower.includes("drum") || 
              commandLower.includes("developer")) {
      console.log("Detected inventory command");
      return "inventory";
    } else if (commandLower.includes("invoice") || commandLower.includes("bill")) {
      console.log("Detected invoice command");
      return "invoice";
    } else if (commandLower.includes("report") || commandLower.includes("show") || commandLower.includes("how many")) {
      console.log("Detected report command");
      return "report";
    } else if (commandLower.includes("help") || commandLower.includes("what can you do")) {
      console.log("Detected help command");
      return "help";
    } else if (commandLower.includes("new customer") || commandLower.includes("add customer") || 
               commandLower.includes("create lead") || commandLower.includes("naya customer") ||
               commandLower.includes("add new customer")) {
      console.log("Detected customer command");
      return "customer";
    }
    
    console.log("Command not recognized, returning unknown");
    return "unknown";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    console.log("Handling message:", inputValue);
    
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
      const isQuotationRequest = inputValue.toLowerCase().includes("quote") || 
                                inputValue.toLowerCase().includes("quotation") ||
                                inputValue.toLowerCase().includes("price");
      
      if (isQuotationRequest) {
        const parsedQuote = parseQuotationCommand(inputValue);
        
        if (parsedQuote.models.length === 0 || !parsedQuote.customerName) {
          const missingInfoMessage: Message = {
            id: `msg-${Date.now()}-bot`,
            content: (
              <div className="space-y-3">
                <p>I'd be happy to prepare a quotation. Could you please provide the following details:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {!parsedQuote.customerName && <li>Customer name and mobile number</li>}
                  {parsedQuote.models.length === 0 && <li>Product model name</li>}
                  <li>Quantity (optional, default is 1)</li>
                </ul>
                <p>For example: "Generate quotation for 2 Kyocera 2554ci for ABC Company"</p>
              </div>
            ),
            sender: "bot",
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, missingInfoMessage]);
        } else {
          let customerExists = false;
          if (parsedQuote.customerName) {
            try {
              const { data } = await supabase
                .from('customers')
                .select('id, name')
                .ilike('name', `%${parsedQuote.customerName}%`)
                .limit(1);
              
              customerExists = data && data.length > 0;
            } catch (error) {
              console.error("Error checking customer:", error);
            }
          }
          
          if (!customerExists) {
            const noCustomerMessage: Message = {
              id: `msg-${Date.now()}-bot`,
              content: (
                <div className="space-y-3">
                  <p>I don't see this customer in our database. Would you like to add them first?</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setInputValue(`Add new customer ${parsedQuote.customerName}`);
                      }}
                    >
                      Add Customer
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setQuotationData(parsedQuote);
                      }}
                    >
                      Continue with Quotation
                    </Button>
                  </div>
                </div>
              ),
              sender: "bot",
              timestamp: new Date(),
            };
            
            setMessages((prev) => [...prev, noCustomerMessage]);
          } else {
            const quotationDetails = `
Quotation Request:
- Customer: ${parsedQuote.customerName}
- Product: ${parsedQuote.models.map(m => m.model).join(", ")}
- Quantity: ${parsedQuote.models.map(m => m.quantity).join(", ")}
- Price: ₹${parsedQuote.models.map(m => {
  const product = products.find(p => p.id === m.productId);
  return product ? (165000 * m.quantity).toLocaleString() : (150000 * m.quantity).toLocaleString();
}).join(", ")}
`;

            try {
              const aiResponse = await processClaudeAI(quotationDetails);
              
              const quotSummaryMessage: Message = {
                id: `msg-${Date.now()}-bot`,
                content: (
                  <div className="space-y-3">
                    <p>{aiResponse}</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setQuotationData(parsedQuote);
                        }}
                      >
                        Generate Quotation
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          // Do nothing
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ),
                sender: "bot",
                timestamp: new Date(),
                isAiResponse: true,
                aiModel: "claude-3-7"
              };
              
              setMessages((prev) => [...prev, quotSummaryMessage]);
            } catch (error) {
              console.error("Error getting AI response:", error);
              
              const quotConfirmMessage: Message = {
                id: `msg-${Date.now()}-bot`,
                content: (
                  <div className="space-y-3">
                    <p>I can create a quotation for {parsedQuote.customerName} for {parsedQuote.models.map(m => m.model).join(", ")}. Would you like to proceed?</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setQuotationData(parsedQuote);
                        }}
                      >
                        Generate Quotation
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          // Do nothing
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ),
                sender: "bot",
                timestamp: new Date(),
              };
              
              setMessages((prev) => [...prev, quotConfirmMessage]);
            }
          }
        }
      } else if (isMobileNumber(inputValue)) {
        const customer = await getCustomerFromSupabase(inputValue);
        
        if (customer) {
          const loadingMessage: Message = {
            id: `msg-${Date.now()}-bot-loading`,
            content: "Retrieving customer profile...",
            sender: "bot",
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, loadingMessage]);
          
          const prompt = await buildCustomerProfilePrompt(customer);
          
          try {
            const aiResponse = await processClaudeAI(prompt);
            
            setMessages((prev) => prev.filter(msg => msg.id !== loadingMessage.id));
            
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
            setMessages((prev) => prev.filter(msg => msg.id !== loadingMessage.id));
            
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
                {parsedTask.missingFields.includes("title") && (
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

  useEffect(() => {
    const handleSmartAssistantCommand = (event: CustomEvent) => {
      if (event.detail && event.detail.command) {
        setInputValue(event.detail.command);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    window.addEventListener('smart-assistant-command', handleSmartAssistantCommand as EventListener);

    return () => {
      window.removeEventListener('smart-assistant-command', handleSmartAssistantCommand as EventListener);
    };
  }, []);

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
