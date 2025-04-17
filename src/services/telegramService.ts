
import { toast } from "sonner";
import { CustomerType } from "@/types/customer";

// Mock function for notifying about new customer
export const notifyNewCustomer = async (customer: CustomerType) => {
  console.log("Notification service removed, would have notified about new customer:", customer);
  return true;
};

// Mock function for follow-up notifications
export const notifyFollowUp = async (followUpData: any) => {
  console.log("Notification service removed, would have sent follow-up notification:", followUpData);
  return true;
};

// Mock function for service call notifications
export const notifyServiceCall = async (serviceCallData: any) => {
  console.log("Notification service removed, would have sent service call notification:", serviceCallData);
  return true;
};

// Mock function for inventory alerts
export const notifyInventoryAlert = async (inventoryItem: any) => {
  console.log("Notification service removed, would have sent inventory alert:", inventoryItem);
  return true;
};

// Add any other notification functions that might be needed
export const sendMessageToChat = async (chatId: string, message: string) => {
  console.log(`Notification service removed, would have sent message to chat ${chatId}:`, message);
  return true;
};

// Generic notification function that can be used for various purposes
export const sendNotification = async (type: string, data: any) => {
  console.log(`Notification service removed, would have sent ${type} notification:`, data);
  toast.info("Notification system has been removed from the application");
  return true;
};
