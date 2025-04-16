
import { format, isToday, isThisWeek, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { SalesFollowUp } from "../machines/types";
import { toast } from "sonner";

// Helper function to validate the follow-up type
export const validateFollowUpType = (type: string): "quotation" | "demo" | "negotiation" | "closure" => {
  const validTypes = ["quotation", "demo", "negotiation", "closure"];
  return validTypes.includes(type) 
    ? type as "quotation" | "demo" | "negotiation" | "closure" 
    : "quotation"; // Default to quotation if an invalid type is provided
};

// Fetch follow-ups from database
export const fetchFollowUps = async (): Promise<SalesFollowUp[] | null> => {
  try {
    console.log("Fetching follow-ups from database");
    // Fetch all follow-ups from the database (both pending and completed)
    const { data, error } = await supabase
      .from('sales_followups')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error("Error fetching follow-ups:", error);
      toast.error("Failed to load follow-ups");
      return null;
    }
    
    console.log("Fetched follow-ups data:", data);
    
    if (data) {
      // Map to our SalesFollowUp type with proper type validation
      const formattedFollowUps: SalesFollowUp[] = data.map(item => ({
        id: item.id,
        date: new Date(item.date),
        customerId: item.customer_id,
        customerName: item.customer_name,
        notes: item.notes || "",
        // Ensure status matches the expected union type
        status: item.status === "completed" ? "completed" : "pending",
        // Ensure type matches the expected union type
        type: validateFollowUpType(item.type),
        contactPhone: item.contact_phone || "",
        location: item.location || "",
        reminderSent: item.reminder_sent || false
      }));
      
      console.log("Formatted follow-ups:", formattedFollowUps);
      return formattedFollowUps;
    }
    
    return [];
  } catch (error) {
    console.error("Error in fetchFollowUps:", error);
    toast.error("An error occurred loading follow-ups");
    return null;
  }
};

// Mark a follow-up as complete
export const markFollowUpComplete = async (id: number): Promise<boolean> => {
  try {
    console.log("Marking follow-up complete:", id);
    const { error } = await supabase
      .from('sales_followups')
      .update({ status: 'completed' })
      .eq('id', id);
      
    if (error) {
      console.error("Error completing follow-up:", error);
      toast.error("Failed to mark follow-up as complete");
      return false;
    }
    
    toast.success("Follow-up marked as complete!");
    return true;
  } catch (error) {
    console.error("Error in markFollowUpComplete:", error);
    return false;
  }
};

// Helper functions for contacts
export const handleCall = (phone?: string) => {
  if (phone) {
    window.location.href = `tel:${phone}`;
    toast.info(`Calling ${phone}`);
  } else {
    toast.error("No phone number available");
  }
};

export const handleWhatsApp = (phone?: string) => {
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
    toast.info("Opening WhatsApp chat");
  } else {
    toast.error("No phone number available");
  }
};

// Manually trigger follow-up reminders for today
export const triggerTodayReminders = async () => {
  try {
    toast.info("Sending follow-up reminders...");
    
    console.log("Triggering follow-up reminders for today");
    const { data, error } = await supabase.functions.invoke('daily-followup-reminders', {
      method: 'POST'
    });
    
    console.log("Response from daily-followup-reminders:", data, error);
    
    if (error) {
      console.error("Error triggering follow-up reminders:", error);
      toast.error("Failed to send follow-up reminders");
      return false;
    }
    
    // Enhanced response handling with more detailed feedback
    if (data) {
      if (data.success) {
        if (data.details && data.details.reminders_sent > 0) {
          toast.success(`Successfully sent ${data.details.reminders_sent} reminders`);
        } else {
          toast.success(data.message || "Reminders processed successfully");
        }
        return true;
      } else if (data.message && data.message.includes('No pending follow-ups')) {
        toast.info("No pending follow-ups found for today");
        return true;
      } else if (data.message && data.message.includes('No active telegram chats')) {
        toast.warning("No active Telegram chats found. Please authorize chats in Telegram Admin settings.");
        return false;
      } else {
        toast.warning(data.message || "No reminders were sent. Check configuration.");
        return false;
      }
    } else {
      toast.error("Unknown response from reminders service");
      return false;
    }
  } catch (error) {
    console.error("Error in triggerTodayReminders:", error);
    toast.error("Error sending follow-up reminders");
    return false;
  }
};

// Filter follow-ups based on criteria
export const filterFollowUps = (
  followUps: SalesFollowUp[],
  activeTab: "today" | "week" | "all" | "completed",
  searchTerm: string,
  typeFilter: string | null
): SalesFollowUp[] => {
  return followUps.filter(followUp => {
    // Status filter based on tab
    const matchesTab = 
      activeTab === "all" ? followUp.status === "pending" :
      activeTab === "completed" ? followUp.status === "completed" :
      activeTab === "today" ? followUp.status === "pending" && isToday(followUp.date) :
      activeTab === "week" ? followUp.status === "pending" && isThisWeek(followUp.date) : 
      false;
    
    // Type filter
    const matchesType = !typeFilter || followUp.type === typeFilter;
    
    // Search filter for customer name or notes
    const matchesSearch = !searchTerm || 
      followUp.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (followUp.notes && followUp.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (followUp.location && followUp.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesTab && matchesType && matchesSearch;
  });
};

// Calculate completion stats for today
export const calculateTodayStats = (followUps: SalesFollowUp[]) => {
  const todayTotal = followUps.filter(followUp => isToday(followUp.date)).length;
  const todayCompleted = followUps.filter(followUp => isToday(followUp.date) && followUp.status === "completed").length;
  const todayProgress = todayTotal === 0 ? 0 : (todayCompleted / todayTotal) * 100;
  
  return { todayTotal, todayCompleted, todayProgress };
};
