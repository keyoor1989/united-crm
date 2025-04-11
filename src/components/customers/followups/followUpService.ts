
import { SalesFollowUp } from "../machines/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isToday, isThisWeek } from "date-fns";

// Fetch follow-ups from the database
export const fetchAllFollowUps = async (): Promise<SalesFollowUp[] | null> => {
  try {
    console.log("Fetching all follow-ups from database");
    const { data, error } = await supabase
      .from('sales_followups')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error("Error fetching follow-ups:", error);
      toast.error("Failed to load follow-ups");
      return null;
    }
    
    console.log("Follow-ups data from database:", data);
    
    if (data) {
      const formattedFollowUps: SalesFollowUp[] = data.map(item => ({
        id: item.id,
        date: new Date(item.date),
        customerId: item.customer_id,
        customerName: item.customer_name,
        notes: item.notes || "",
        status: item.status === "completed" ? "completed" : "pending",
        type: validateFollowUpType(item.type),
        contactPhone: item.contact_phone || "",
        location: item.location || ""
      }));
      
      console.log("Formatted follow-ups:", formattedFollowUps);
      return formattedFollowUps;
    }
    
    return [];
  } catch (error) {
    console.error("Error in fetchAllFollowUps:", error);
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

// Helper function to validate the follow-up type
export const validateFollowUpType = (type: string): "quotation" | "demo" | "negotiation" | "closure" => {
  const validTypes = ["quotation", "demo", "negotiation", "closure"];
  return validTypes.includes(type) 
    ? type as "quotation" | "demo" | "negotiation" | "closure" 
    : "quotation";
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
