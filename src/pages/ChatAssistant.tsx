
import React from "react";
import Layout from "@/components/layout/Layout";
import EnhancedChatInterface from "@/components/chat/EnhancedChatInterface";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Package, 
  ListChecks, 
  BarChart4,
  UserPlus,
  ClipboardList,
  Phone
} from "lucide-react";
import { Card } from "@/components/ui/card";
import "@/components/chat/chat-assistant.css";

const ChatAssistant = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Smart Chat Assistant</h1>
            <p className="text-muted-foreground">
              Ask me anything about your business or give me commands to perform tasks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4">
          <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Create Quotation</span>
            </Button>
          </Card>
          <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span>Check Inventory</span>
            </Button>
          </Card>
          <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <span>Add Customer</span>
            </Button>
          </Card>
          <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <ListChecks className="h-4 w-4 text-primary" />
              <span>Create Task</span>
            </Button>
          </Card>
          <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <span>Add Follow-up</span>
            </Button>
          </Card>
          <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>Lookup Customer</span>
            </Button>
          </Card>
          <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <BarChart4 className="h-4 w-4 text-primary" />
              <span>View Reports</span>
            </Button>
          </Card>
        </div>

        <EnhancedChatInterface />
      </div>
    </Layout>
  );
};

export default ChatAssistant;
