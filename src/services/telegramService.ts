
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomerType } from "@/types/customer";

// Function to store Telegram webhook configuration
export const storeTelegramConfig = async (webhookUrl: string, webhookSecret: string) => {
  try {
    const { data, error } = await supabase
      .from('telegram_config')
      .insert({ webhook_url: webhookUrl, webhook_secret: webhookSecret })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    toast.error("Failed to store Telegram configuration");
    console.error("Telegram config error:", error);
    return null;
  }
};

// Function to get current Telegram webhook configuration
export const getTelegramConfig = async () => {
  try {
    const { data, error } = await supabase
      .from('telegram_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Telegram config retrieval error:", error);
    return null;
  }
};

// Restored notification functions with mock implementation
export const notifyNewCustomer = async (customer: CustomerType) => {
  console.log("Notification service would have notified about new customer:", customer);
  return true;
};

export const notifyFollowUp = async (followUpData: any) => {
  console.log("Notification service would have sent follow-up notification:", followUpData);
  return true;
};

export const sendMessageToChat = async (chatId: string, message: string) => {
  console.log(`Notification service would have sent message to chat ${chatId}:`, message);
  return true;
};

export const sendNotification = async (type: string, data: any) => {
  console.log(`Notification service would have sent ${type} notification:`, data);
  toast.info("Notification system is currently mocked");
  return true;
};

// Adding the missing functions to fix build errors
export const notifyInventoryAlert = async (alertData: any) => {
  console.log("Mock inventory alert notification:", alertData);
  return true;
};

export const notifyServiceCall = async (serviceCallData: any) => {
  console.log("Mock service call notification:", serviceCallData);
  return true;
};
