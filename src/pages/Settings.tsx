
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, MessageSquare, Send } from "lucide-react";

const Settings = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              System preferences and configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure general system settings, defaults, and preferences.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" disabled>Coming Soon</Button>
          </CardFooter>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Telegram Bot
            </CardTitle>
            <CardDescription>
              Configure the Telegram bot integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set up webhooks, manage authorized chats, and configure notification settings for the Telegram bot.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link to="/telegram-admin">Manage Telegram Bot</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
