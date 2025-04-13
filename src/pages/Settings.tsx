
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareText, Settings as SettingsIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/telegram-admin">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5" />
                Telegram Bot Settings
              </CardTitle>
              <CardDescription>
                Configure your Telegram bot for notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Connect with Telegram, authorize chats, and set up notification preferences
                for service calls, inventory alerts, and more.
              </p>
            </CardContent>
          </Card>
        </Link>
        
        {/* Placeholder for future settings options */}
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
              Coming soon: Configure general system settings, defaults, and preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
