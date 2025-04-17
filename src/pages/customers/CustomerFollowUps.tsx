
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFollowUps } from "@/hooks/useFollowUps";
import FollowUpHeader from "@/components/customers/followups/FollowUpHeader";
import FollowUpTabs from "@/components/customers/followups/FollowUpTabs";
import FollowUpFilters from "@/components/customers/followups/FollowUpFilters";
import FollowUpProgress from "@/components/customers/followups/FollowUpProgress";
import FollowUpList from "@/components/customers/followups/FollowUpList";
import FollowUpsLoading from "@/components/customers/followups/FollowUpsLoading";

const CustomerFollowUps = () => {
  const {
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
  } = useFollowUps();
  
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <FollowUpHeader 
          onRefresh={loadFollowUps} 
          totalToday={todayTotal} 
          completedToday={todayCompleted} 
          onSendReminders={handleSendReminders}
          isSendingReminders={isSendingReminders}
        />
        <FollowUpsLoading />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6">
      <FollowUpHeader 
        onRefresh={loadFollowUps} 
        totalToday={todayTotal} 
        completedToday={todayCompleted} 
        onSendReminders={handleSendReminders}
        isSendingReminders={isSendingReminders}
      />
      
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Follow-ups Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FollowUpTabs 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
            
            <FollowUpFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              showFilters={showFilters}
              toggleFilters={toggleFilters}
            />
            
            {activeTab === "today" && (
              <FollowUpProgress
                todayCompleted={todayCompleted}
                todayTotal={todayTotal}
                todayProgress={todayProgress}
              />
            )}
            
            <FollowUpList 
              followUps={filteredFollowUps}
              activeTab={activeTab}
              onMarkComplete={handleMarkComplete}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerFollowUps;
