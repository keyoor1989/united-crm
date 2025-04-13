
import { supabase } from "@/integrations/supabase/client";
import { CustomerType } from "@/types/customer";

// Function to send a notification about a new service call
export const notifyServiceCall = async (serviceCall: any) => {
  try {
    const { error } = await supabase.functions.invoke('telegram-notify', {
      body: {
        notification_type: 'service_call',
        data: serviceCall
      }
    });

    if (error) {
      console.error("Error sending service call notification:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending service call notification:", error);
    return false;
  }
};

// Function to send a notification about a follow-up
export const notifyFollowUp = async (followUp: any) => {
  try {
    const { error } = await supabase.functions.invoke('telegram-notify', {
      body: {
        notification_type: 'follow_up',
        data: followUp
      }
    });

    if (error) {
      console.error("Error sending follow-up notification:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending follow-up notification:", error);
    return false;
  }
};

// Function to send a notification about low inventory
export const notifyInventoryAlert = async (item: any) => {
  try {
    const { error } = await supabase.functions.invoke('telegram-notify', {
      body: {
        notification_type: 'inventory_alert',
        data: item
      }
    });

    if (error) {
      console.error("Error sending inventory alert notification:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending inventory alert notification:", error);
    return false;
  }
};

// Function to send a notification about a new customer
export const notifyNewCustomer = async (customer: CustomerType) => {
  try {
    const { error } = await supabase.functions.invoke('telegram-notify', {
      body: {
        notification_type: 'new_customer',
        data: customer
      }
    });

    if (error) {
      console.error("Error sending new customer notification:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending new customer notification:", error);
    return false;
  }
};
