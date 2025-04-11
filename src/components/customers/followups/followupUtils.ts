
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
    // Fetch all pending follow-ups from the database
    const { data, error } = await supabase
      .from('sales_followups')
      .select('*')
      .eq('status', 'pending')
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
        location: item.location || ""
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

// Filter follow-ups based on selected tab
export const filterFollowUps = (
  followUps: SalesFollowUp[], 
  activeTab: "today" | "week" | "all"
): SalesFollowUp[] => {
  return followUps.filter(followUp => {
    switch (activeTab) {
      case "today":
        return isToday(followUp.date);
      case "week":
        return isThisWeek(followUp.date);
      case "all":
        return true;
      default:
        return false;
    }
  });
};

// Calculate completion stats
export const calculateCompletionStats = (followUps: SalesFollowUp[]) => {
  const todayTotal = followUps.filter(followUp => isToday(followUp.date)).length;
  const todayCompleted = 0; // We're only showing pending ones, so completed is 0
  const todayProgress = todayTotal === 0 ? 0 : (todayCompleted / todayTotal) * 100;
  
  return { todayTotal, todayCompleted, todayProgress };
};
