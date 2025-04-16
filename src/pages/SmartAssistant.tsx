
import React, { useState } from "react";
import EnhancedChatInterface from "@/components/chat/EnhancedChatInterface";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Package, 
  ListChecks, 
  BarChart4,
  UserPlus,
  ClipboardList,
  Phone,
  Settings,
  Plus
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiKeyManager from "@/components/chat/api/ApiKeyManager";
import "@/components/chat/chat-assistant.css";

const SmartAssistant = () => {
  const [activeTab, setActiveTab] = useState("chat");

  const handleQuickAction = (action: string) => {
    console.log("Smart Assistant: Handling quick action:", action);
    
    switch(action) {
      case "quotation":
        // Send command to chat interface
        window.dispatchEvent(new CustomEvent('smart-assistant-command', { 
          detail: { command: "Create quotation for " }
        }));
        break;
      case "inventory":
        window.dispatchEvent(new CustomEvent('smart-assistant-command', { 
          detail: { command: "Check inventory for " }
        }));
        break;
      case "customer":
        window.dispatchEvent(new CustomEvent('smart-assistant-command', { 
          detail: { command: "Add new customer " }
        }));
        break;
      case "task":
        window.dispatchEvent(new CustomEvent('smart-assistant-command', { 
          detail: { command: "Create a task for " }
        }));
        break;
      case "follow-up":
        window.dispatchEvent(new CustomEvent('smart-assistant-command', { 
          detail: { command: "Add follow-up for " }
        }));
        break;
      case "lookup":
        window.dispatchEvent(new CustomEvent('smart-assistant-command', { 
          detail: { command: "Lookup customer " }
        }));
        break;
      case "quickquote":
        window.dispatchEvent(new CustomEvent('smart-assistant-command', { 
          detail: { command: "Generate quotation for Kyocera 2554ci for " }
        }));
        break;
      case "reports":
        window.dispatchEvent(new CustomEvent('smart-assistant-command', { 
          detail: { command: "Show report for " }
        }));
        break;
      default:
        break;
    }
    // Ensure the chat tab is active
    setActiveTab("chat");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Smart Assistant</h1>
          <p className="text-muted-foreground">
            Your AI-powered business assistant
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Assistant Chat</TabsTrigger>
            <TabsTrigger value="settings">API Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="chat">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                onClick={() => handleQuickAction("quotation")}
              >
                <FileText className="h-4 w-4 text-primary" />
                <span>Create Quotation</span>
              </Button>
            </Card>
            <Card className="p-3 hover:bg-accent cursor-pointer transition-colors border-primary/20 bg-primary/5">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                onClick={() => handleQuickAction("quickquote")}
              >
                <Plus className="h-4 w-4 text-primary" />
                <span>Quick Quote</span>
              </Button>
            </Card>
            <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                onClick={() => handleQuickAction("lookup")}
              >
                <Phone className="h-4 w-4 text-primary" />
                <span>Lookup Customer</span>
              </Button>
            </Card>
            <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                onClick={() => handleQuickAction("follow-up")}
              >
                <ClipboardList className="h-4 w-4 text-primary" />
                <span>Add Follow-up</span>
              </Button>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                onClick={() => handleQuickAction("inventory")}
              >
                <Package className="h-4 w-4 text-primary" />
                <span>Check Inventory</span>
              </Button>
            </Card>
            <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                onClick={() => handleQuickAction("task")}
              >
                <ListChecks className="h-4 w-4 text-primary" />
                <span>Create Task</span>
              </Button>
            </Card>
            <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                onClick={() => handleQuickAction("customer")}
              >
                <UserPlus className="h-4 w-4 text-primary" />
                <span>Add Customer</span>
              </Button>
            </Card>
            <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                onClick={() => handleQuickAction("reports")}
              >
                <BarChart4 className="h-4 w-4 text-primary" />
                <span>View Reports</span>
              </Button>
            </Card>
          </div>

          <EnhancedChatInterface />
        </TabsContent>
        
        <TabsContent value="settings">
          <ApiKeyManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartAssistant;
