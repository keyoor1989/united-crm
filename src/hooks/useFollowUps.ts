
import { useState, useEffect } from "react";
import { SalesFollowUp } from "@/components/customers/machines/types";
import { 
  fetchAllFollowUps, 
  markFollowUpComplete, 
  filterFollowUps,
  calculateTodayStats
} from "@/components/customers/followups/followUpService";

export const useFollowUps = () => {
  const [followUps, setFollowUps] = useState<SalesFollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"today" | "week" | "all" | "completed">("today");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    loadFollowUps();
  }, []);
  
  const loadFollowUps = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllFollowUps();
      if (data) {
        setFollowUps(data);
      }
    } catch (error) {
      console.error("Error loading follow-ups:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMarkComplete = async (id: number) => {
    const success = await markFollowUpComplete(id);
    if (success) {
      // Update local state
      setFollowUps(followUps.map(item => 
        item.id === id ? { ...item, status: "completed" } : item
      ));
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
    handleMarkComplete
  };
};
