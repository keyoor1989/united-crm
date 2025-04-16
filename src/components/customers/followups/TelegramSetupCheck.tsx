
import React, { useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const TelegramSetupCheck = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveChats, setHasActiveChats] = useState(false);
  const [hasFollowupPreferences, setHasFollowupPreferences] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    checkTelegramSetup();
  }, []);
  
  const checkTelegramSetup = async () => {
    setIsLoading(true);
    try {
      // Check for active chats
      const { data: chats, error: chatsError } = await supabase
        .from('telegram_authorized_chats')
        .select('*')
        .eq('is_active', true);
      
      if (chatsError) throw chatsError;
      
      const chatIds = chats?.map(chat => chat.chat_id) || [];
      setHasActiveChats(chatIds.length > 0);
      
      if (chatIds.length > 0) {
        // Check for follow-up preferences
        const { data: prefs, error: prefsError } = await supabase
          .from('telegram_notification_preferences')
          .select('*')
          .in('chat_id', chatIds)
          .eq('customer_followups', true);
        
        if (prefsError) throw prefsError;
        
        setHasFollowupPreferences(prefs && prefs.length > 0);
      }
    } catch (error) {
      console.error("Error checking Telegram setup:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return null;
  }
  
  if (hasActiveChats && hasFollowupPreferences) {
    return null; // All good, don't show anything
  }
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Telegram Reminder Configuration Issue</AlertTitle>
      <AlertDescription>
        {!hasActiveChats ? (
          <div className="mt-2">
            <p>No active Telegram chats found. You need to set up and authorize Telegram chats first.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => navigate("/telegram-admin")}
            >
              <Link className="mr-2 h-4 w-4" />
              Go to Telegram Setup
            </Button>
          </div>
        ) : !hasFollowupPreferences ? (
          <div className="mt-2">
            <p>No chat is configured to receive follow-up notifications. You need to enable follow-up notifications for at least one chat.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => navigate("/telegram-admin?tab=notifications")}
            >
              <Link className="mr-2 h-4 w-4" />
              Configure Notification Preferences
            </Button>
          </div>
        ) : null}
      </AlertDescription>
    </Alert>
  );
};

export default TelegramSetupCheck;
