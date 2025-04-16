
import { useState, useEffect } from "react";
import { SalesFollowUp } from "@/components/customers/machines/types";
import { 
  fetchFollowUps, 
  markFollowUpComplete, 
  filterFollowUps,
  calculateTodayStats,
  triggerTodayReminders
} from "@/components/customers/followups/followUpService";
import { toast } from "sonner";

export const useFollowUps = () => {
  const [followUps, setFollowUps] = useState<SalesFollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"today" | "week" | "all" | "completed">("today");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  
  useEffect(() => {
    loadFollowUps();
  }, []);
  
  const loadFollowUps = async () => {
    setIsLoading(true);
    try {
      console.log("Loading follow-ups...");
      const data = await fetchFollowUps();
      console.log("Follow-ups loaded:", data);
      if (data) {
        setFollowUps(data);
      }
    } catch (error) {
      console.error("Error loading follow-ups:", error);
      toast.error("Failed to load follow-ups");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMarkComplete = async (id: number) => {
    console.log("Marking follow-up complete in hook:", id);
    try {
      const success = await markFollowUpComplete(id);
      if (success) {
        // Update local state
        setFollowUps(prevFollowUps => 
          prevFollowUps.map(item => 
            item.id === id ? { ...item, status: "completed" } : item
          )
        );
        toast.success("Follow-up marked as complete!");
      }
    } catch (error) {
      console.error("Error marking follow-up complete:", error);
      toast.error("Failed to mark follow-up as complete");
    }
  };

  const handleSendReminders = async () => {
    setIsSendingReminders(true);
    try {
      const result = await triggerTodayReminders();
      if (result) {
        // Refresh data to get updated reminder status
        await loadFollowUps();
      }
    } catch (error) {
      console.error("Error sending reminders:", error);
      toast.error("Failed to send reminders");
    } finally {
      setIsSendingReminders(false);
    }
  };
  
  // Filter follow-ups based on criteria
  const filteredFollowUps = filterFollowUps(followUps, activeTab, searchTerm, typeFilter);
  
  // Calculate completion stats for today
  const { todayTotal, todayCompleted, todayProgress } = calculateTodayStats(followUps);
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  return {
    followUps,
    filteredFollowUps,
    isLoading,
    activeTab,
    setActiveTab,
    typeFilter,
    setTypeFilter,
    searchTerm,
    setSearchTerm,
    showFilters,
    toggleFilters,
    todayTotal,
    todayCompleted,
    todayProgress,
    loadFollowUps,
    handleMarkComplete,
    handleSendReminders,
    isSendingReminders
  };
};
