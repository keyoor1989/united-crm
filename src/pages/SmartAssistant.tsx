
import React, { useState, useEffect } from "react";
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
  Phone,
  Key
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiKeyManager from "@/components/chat/api/ApiKeyManager";
import "@/components/chat/chat-assistant.css";

const SmartAssistant = () => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <Layout>
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
          </TabsContent>
          
          <TabsContent value="settings">
            <ApiKeyManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SmartAssistant;
